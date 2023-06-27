import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from "three";

const SVGShapes = ({ path, material, group }) => {
  const shapes = useLoader(SVGLoader, path);

  let renderOrder = 0;

   let shape=shapes
   console.log(shape,"shap")
    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    // Set the desired properties for the mesh
    mesh.renderOrder = renderOrder++;
    group.add(mesh);
  	return null; // Since this component is only responsible for adding meshes to the group, return null
};

export default SVGShapes;
