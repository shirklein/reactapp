import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 300);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // FBX files and their desired positions
        const loader = new FBXLoader();
        const models = [];
        const defaultRotations = new Map();
        const hoverTexts = new Map();
        const filesWithPositions = [
            { file: 'rut.fbx', position: { x: -30, y: 150, z: 0 }, text: 'This is Rut' },
            { file: 'boaz.fbx', position: { x: 30, y: 150, z: 0 }, text: 'This is Boaz' },
            { file: 'oved.fbx', position: { x: 0, y: 80, z: 0 }, text: 'This is Oved' },
            { file: 'ishay.fbx', position: { x: 0, y: 15, z: 0 }, text: 'This is Ishay' },
            { file: 'david.fbx', position: { x: -120, y: -50, z: 0 }, text: 'This is David' },
            { file: 'batsheva.fbx', position: { x: -40, y: -50, z: 0 }, text: 'This is Batsheva' },
            { file: 'michal.fbx', position: { x: 40, y: -50, z: 0 }, text: 'This is Michal' },
            { file: 'achinoam.fbx', position: { x: 120, y: -50, z: 0 }, text: 'אני אחינועם היזראעלית' },
            { file: 'shlomo.fbx', position: { x: -120, y: -120, z: 0 }, text: 'This is Shlomo' },
            { file: 'avshalom.fbx', position: { x: -37, y: -120, z: 0 }, text: 'This is Avshalom' },
            { file: 'amnon.fbx', position: { x: 37, y: -120, z: 0 }, text: 'This is Amnon' },
            { file: 'tamar.fbx', position: { x: 120, y: -120, z: 0 }, text: 'This is Tamar' }
        ];

        filesWithPositions.forEach(({ file, position, text }) => {
            const fileaa = '/Users/shirklein/source/repos/my-new-react-app/models_amit/rut.fbx';
            console.log(`Loading ${file} from ${fileaa}`);
            const filePath = `/Users/shirklein/source/repos/my-new-react-app/models_amit/${file}`;
            console.log(`Loading ${file} from ${filePath}`);
            loader.load(
                fileaa,
                (object) => {
                    console.log(`Before traverse ${file}`);
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.name = `${file.replace('.fbx', '')}_${child.name || 'Unnamed'}`;
                        }
                    });
                    object.name = file.replace('.fbx', '');
                    object.scale.set(0.25, 0.25, 0.25);
                    object.position.set(position.x, position.y, position.z);

                    defaultRotations.set(object, object.rotation.clone());
                    hoverTexts.set(object.name, text);

                    console.log(`Saved default rotation and text for: ${object.name}`);
                    scene.add(object);
                    models.push(object);
                },
                (progress) => {
                    if (progress.total) {
                        console.log(`Progress: ${(progress.loaded / progress.total) * 100}%`);
                    } else {
                        console.log(`Progress: ${progress.loaded} bytes loaded`);
                    }
                },
                (error) => {
                    console.error(`Error loading ${file}:`, error);
                    console.error(`Error details: ${error.message}`);
                }
            );
        });

        // Raycaster setup
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const hoverTextDiv = document.getElementById('hoverText');

        const onMouseMove = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', onMouseMove);

        let lastHoveredObject = null;
        const mouseWorldPosition = new THREE.Vector3();

        const checkIntersections = () => {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(models.map((model) => model.children).flat(), true);

            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object.parent || intersects[0].object;

                if (hoveredObject !== lastHoveredObject) {
                    lastHoveredObject = hoveredObject;

                    const text = hoverTexts.get(hoveredObject.name) || 'No description available';
                    hoverTextDiv.textContent = text;
                    hoverTextDiv.style.display = 'block';
                }
            } else {
                lastHoveredObject = null;
                hoverTextDiv.style.display = 'none';
            }

            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, -1), 100), mouseWorldPosition);

            models.forEach((model) => {
                if (model !== lastHoveredObject) {
                    model.lookAt(mouseWorldPosition);
                }
            });
        };

        const animate = () => {
            requestAnimationFrame(animate);
            checkIntersections();
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ThreeScene;