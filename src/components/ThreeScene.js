import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        // יצירת סצנה
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // יצירת מצלמה
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 350, 700); // הרחקת המצלמה כדי להכליל את כל האובייקטים
        camera.lookAt(0, 200, 0); // מיקוד המצלמה במרכז הסידור

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
        const filesWithPositions = [
            { file: 'boaz.fbx', position: { x: 150, y: 500, z: 0 } },
            { file: 'rut.fbx', position: { x: -150, y: 500, z: 0 } },
            { file: 'oved.fbx', position: { x: 0, y: 350, z: 0 } },
            { file: 'ishay.fbx', position: { x: 0, y: 200, z: 0 } },
            { file: 'david.fbx', position: { x: -400, y: 50, z: 0 } },
            { file: 'achinoam.fbx', position: { x: -150, y: 50, z: 0 } },
            { file: 'batsheva.fbx', position: { x: 150, y: 50, z: 0 } },
            { file: 'michal.fbx', position: { x: 300, y: 50, z: 0 } },
            { file: 'shlomo.fbx', position: { x: -300, y: -100, z: 0 } },
            { file: 'avshalom.fbx', position: { x: -150, y: -100, z: 0 } },
            { file: 'amnon.fbx', position: { x: 150, y: -100, z: 0 } },
            { file: 'tamar.fbx', position: { x: 300, y: -100, z: 0 } }
        ];

        filesWithPositions.forEach(({ file, position }) => {
            const filePath = require(`./../../models_amit/${file}`);
            loader.load(
                filePath,
                (object) => {
                    object.scale.set(0.5, 0.5, 0.5); // הגדלת גודל האובייקטים
                    object.position.set(position.x, position.y, position.z);
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

            // הקרנת העכבר למישור במרחק 500 מהמצלמה
            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -200);
            raycaster.ray.intersectPlane(plane, mouseWorldPosition);

            // עדכון סיבוב המודלים כך שיסתכלו על תנועות העכבר
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

    return <div ref={mountRef} />;
};

export default ThreeScene;
