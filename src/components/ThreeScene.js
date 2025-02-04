import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const isMounted = useRef(false);
    const [hoveredObject, setHoveredObject] = useState(null);

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

        // תאורה
        const ambientLight = new THREE.AmbientLight(0xffffff, 3);
        scene.add(ambientLight);

        // טעינת מודלים
        const loader = new FBXLoader();
        const models = [];
        const objectNames = {
            'david.fbx': 'דוד המלך היה המלך השני של עם ישראל לפני כ-3000 שנה',
            'boaz.fbx': 'בעז היה סבו של דוד המלך',
            'rut.fbx': 'רות המואביה הייתה אשתו של בעז ואימו של עובד',
            'ishay.fbx': 'ישי היה אביו של דוד המלך',
            'achinoam.fbx': 'אחינועם הייתה אחת מנשות דוד',
            'amnon.fbx': 'אמנון היה בנו של דוד',
            'avshalom.fbx': 'אבשלום היה בנו של דוד',
            'batsheva.fbx': 'בת שבע הייתה אשתו של דוד ואמו של שלמה',
            'michal.fbx': 'מיכל הייתה בת שאול ואשתו של דוד',
            'oved.fbx': 'עובד היה בנם של רות ובעז',
            'shlomo.fbx': 'שלמה היה בנו של דוד ומלך ישראל',
            'tamar.fbx': 'תמר הייתה בתו של דוד המלך'
        };

        const filesWithPositions = Object.keys(objectNames).map((file, index) => ({
            file,
            position: { x: (index % 4) * 200 - 400, y: Math.floor(index / 4) * -200 + 500, z: 0 }
        }));

        filesWithPositions.forEach(({ file, position }) => {
            const filePath = require(`./../../models_amit/${file}`);
            loader.load(
                filePath,
                (object) => {
                    object.scale.set(0.5, 0.5, 0.5);
                    object.position.set(position.x, position.y, position.z);
                    object.traverse(child => {
                        if (child.isMesh) {
                            child.userData.name = objectNames[file];
                        }
                    });
                    scene.add(object);
                    models.push(object);
                },
                undefined,
                (error) => {
                    console.error(`Error loading ${file}:`, error);
                }
            );
        });

        // מעקב אחרי תנועת העכבר
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
                setHoveredObject(intersects[0].object.userData.name || null);
            } else {
                setHoveredObject(null);
            }
            
            raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -200), mouseWorldPosition);
            models.forEach((model) => {
                model.lookAt(mouseWorldPosition);
            });
            
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={mountRef}>
            {hoveredObject && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    {hoveredObject}
                </div>
            )}
        </div>
    );
};

export default ThreeScene;
