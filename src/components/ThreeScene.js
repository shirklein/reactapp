import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const isMounted = useRef(false);
    const [hoveredObject, setHoveredObject] = useState(null);
    const nameDivs = [];

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        // יצירת סצנה
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // יצירת מצלמה
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 350, 700);
        camera.lookAt(0, 200, 0);

        // יצירת רנדרר
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // טעינת גופן
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // תאורה
        const ambientLight = new THREE.AmbientLight(0xffffff, 3);
        scene.add(ambientLight);

        // טעינת מודלים
        const loader = new FBXLoader();
        const models = [];
        const objectNames = {
            'rut.fbx': 'רות המואביה הייתה אשתו של בעז ואימו של עובד',
            'boaz.fbx': 'בעז היה סבו של דוד המלך',
            'oved.fbx': 'עובד היה בנם של רות ובעז',
            'ishay.fbx': 'ישי היה אביו של דוד המלך',
            'david.fbx': 'דוד המלך היה המלך השני של עם ישראל לפני כ-3000 שנה',
            'michal.fbx': 'מיכל הייתה בת שאול ואשתו של דוד',
            'achinoam.fbx': 'אחינועם הייתה אחת מנשות דוד',
            'batsheva.fbx': 'בת שבע הייתה אשתו של דוד ואמו של שלמה',
            'shlomo.fbx': 'שלמה היה בנו של דוד ומלך ישראל',
            'avshalom.fbx': 'אבשלום היה בנו של דוד',
            'amnon.fbx': 'אמנון היה בנו של דוד',
            'tamar.fbx': 'תמר הייתה בתו של דוד המלך'
        };

        const filesWithPositions = [
            { file: 'rut.fbx', position: { x: -100, y: 600, z: 0 } , name: 'רות', hover: 'רות המואביה הייתה אשתו של בעז ואימו של עובד'},
            { file: 'boaz.fbx', position: { x: 100, y: 600, z: 0 } , name: 'בעז', hover: 'בעז היה סבו של דוד המלך'},
            { file: 'oved.fbx', position: { x: 0, y: 400, z: 0 } , name: 'עובד', hover: 'עובד היה בנם של רות ובעז'},
            { file: 'ishay.fbx', position: { x: 0, y: 200, z: 0 } , name: 'ישי', hover: 'ישי היה אביו של דוד המלך'},
            { file: 'david.fbx', position: { x: -200, y: 0, z: 0 } ,name: 'דוד', hover: 'דוד המלך היה המלך השני של עם ישראל לפני כ-3000 שנה'},
            { file: 'michal.fbx', position: { x: 0, y: 0, z: 0 } , name: 'מיכל',  hover: 'מיכל הייתה בת שאול ואשתו של דוד'},
            { file: 'achinoam.fbx', position: { x: 200, y: 0, z: 0 }, name: 'אחינועם היזרעאלית', hover: 'אחינועם הייתה אחת מנשות דוד'},
            { file: 'batsheva.fbx', position: { x: 400, y: 0, z: 0 }, name: 'בת־שבע', hover: 'בת שבע הייתה אשתו של דוד ואמו של שלמה'},
            { file: 'shlomo.fbx', position: { x: -300, y: -200, z: 0 }, name: 'שלמה', hover: 'שלמה היה בנו של דוד ומלך ישראל'},
            { file: 'avshalom.fbx', position: { x: -100, y: -200, z: 0 }, name: 'אבשלום', hover: 'אבשלום היה בנו של דוד'},
            { file: 'amnon.fbx', position: { x: 100, y: -200, z: 0 }, name: 'אמנון', hover: 'אמנון היה בנו של דוד'},
            { file: 'tamar.fbx', position: { x: 300, y: -200, z: 0 },   name: 'תמר', hover: 'תמר הייתה בתו של דוד המלך'}
        ];

        filesWithPositions.forEach(({ file, position, name, hover }) => {
            const filePath = require(`./../../models_amit/${file}`);
            loader.load(
                filePath,
                (object) => {
                    object.scale.set(0.5, 0.5, 0.5);
                    object.position.set(position.x, position.y, position.z);
                    object.traverse(child => {
                        if (child.isMesh) {
                            child.userData.name = name;
                            child.userData.hover = hover;
                        }
                    });
                    //div names for the models
                    console.log('name:', name, 'position:', position);
                    const div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.color = 'black';
                    div.style.fontFamily = 'David Libre, serif';
                    div.style.fontSize = '2.5rem';
                    div.innerHTML = name;
                    mountRef.current.appendChild(div);
                    nameDivs.push({ div, object });
                    scene.add(object);
                    models.push(object);
                },
                undefined,
                (error) => {
                    console.error(`Error loading ${file}:`, error);
                }
            );
        });

        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        const mouseWorldPosition = new THREE.Vector3();

        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        const animate = () => {
            requestAnimationFrame(animate);
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(models, true);
            
            if (intersects.length > 0) {
                setHoveredObject(intersects[0].object.userData.hover || null);
            } else {
                setHoveredObject(null);
            }
            
            raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -200), mouseWorldPosition);
            models.forEach((model) => {
                model.lookAt(mouseWorldPosition);
            });
            
            renderer.render(scene, camera);
            updateNameDivs();
        };

        const updateNameDivs = () => {
            nameDivs.forEach(({ div, object }) => {
                const vector = new THREE.Vector3();
                object.updateMatrixWorld();
                vector.setFromMatrixPosition(object.matrixWorld);
                vector.project(camera);

                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

                // Adjust the y coordinate to move the div closer to the object
                const yOffset = -1700; // Adjust this value as needed
                div.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + yOffset}px)`;
            });
        };

        animate();

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            nameDivs.forEach(({ div }) => {
                mountRef.current.removeChild(div);
            });
        };
    }, []);

    return (
        <div id="Shirdiv" ref={mountRef}>
            {hoveredObject && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    fontFamily: 'David Libre, serif',
                    fontSize: '3rem'
                }}>
                    {hoveredObject}
                </div>
            )}
        </div>
    );
};

export default ThreeScene;
