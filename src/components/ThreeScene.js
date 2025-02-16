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

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 350, 700);
    camera.lookAt(0, 200, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Handle resizing to keep the scene responsive
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Load David Libre font via Google Fonts link
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Prepare FBX loader
    const loader = new FBXLoader();
    const models = [];
    const filesWithPositions = [
      // ... your existing objects with positions, etc.
      { file: 'rut.fbx', position: { x: -100, y: 500, z: 0 }, name: 'רות', hover: '...' },
      { file: 'boaz.fbx', position: { x: 100, y: 500, z: 0 }, name: 'בעז', hover: '...' },
      { file: 'oved.fbx', position: { x: 0, y: 350, z: 0 }, name: 'עובד', hover: '...' },
      { file: 'ishay.fbx', position: { x: 0, y: 170, z: 0 }, name: 'ישי', hover: '...' },
      { file: 'david.fbx', position: { x: 0, y: 0, z: 0 }, name: 'דוד', hover: '...' },
      { file: 'michal.fbx', position: { x: -200, y: 0, z: 0 }, name: 'מיכל', hover: '...' },
      { file: 'achinoam.fbx', position: { x: 200, y: 0, z: 0 }, name: 'אחינועם היזרעאלית', hover: '...' },
      { file: 'batsheva.fbx', position: { x: 400, y: 0, z: 0 }, name: 'בת־שבע', hover: '...' },
      { file: 'shlomo.fbx', position: { x: 0, y: -200, z: 0 }, name: 'שלמה', hover: '...' }
    ];

    // Load models and create name divs
    filesWithPositions.forEach(({ file, position, name, hover }) => {
      const filePath = require(`./../../models_amit/${file}`);
      loader.load(
        filePath,
        (object) => {
          object.scale.set(0.5, 0.5, 0.5);
          object.position.set(position.x, position.y, position.z);
          object.traverse((child) => {
            if (child.isMesh) {
              child.userData.name = name;
              child.userData.hover = hover;
            }
          });

          // Create an HTML div for the model's name
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.color = 'white';
          div.style.fontFamily = 'David Libre, serif';
          // Use clamp to keep font size responsive
          div.style.fontSize = 'clamp(1rem, 2vw, 2.5rem)';
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

    // Raycaster for hover detection
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

      // Make models look at mouse
      raycaster.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 0, 1), -200),
        mouseWorldPosition
      );
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

        // Adjust this offset as needed for your layout
        const yOffset = -1470;
        div.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + yOffset}px)`;
      });
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      nameDivs.forEach(({ div }) => {
        if (mountRef.current.contains(div)) {
          mountRef.current.removeChild(div);
        }
      });
    };
  }, []);

  return (
    <div id="Shirdiv" ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Title at the top-center of the screen */}
      <h1
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'David Libre, serif',
          color: 'white',
          // Use clamp() to keep the text within a range
          fontSize: 'clamp(2rem, 5vw, 5rem)',
          margin: 0,
          padding: '0.5rem',
          zIndex: 9999, // ensure it appears on top
        }}
      >
        שושלת דוד
      </h1>

      {/* Hovered object tooltip */}
      {hoveredObject && (
        <div
          style={{
            position: 'absolute',
            // Use clamp for width and top/left to keep it responsive
            width: 'clamp(200px, 50vw, 500px)',
            top: 'clamp(80px, 10vw, 120px)',
            left: 'clamp(20px, 5vw, 100px)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            color: 'white',
            borderRadius: '0px',
            fontFamily: 'David Libre, serif',
            fontSize: 'clamp(1rem, 3vw, 3rem)',
            padding: 'clamp(10px, 3vw, 50px)',
            zIndex: 9999,
          }}
        >
          {hoveredObject}
        </div>
      )}
    </div>
  );
};

export default ThreeScene;
