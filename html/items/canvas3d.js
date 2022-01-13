//import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.module.js';
import * as THREE from 'three';
import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial, Vector3, WebGLRenderer, 
         sRGBEncoding, ReinhardToneMapping, Scene, PerspectiveCamera, AmbientLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Canvas3d {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
    }

    init( container ) {
        this.container = document.getElementById(container);
        window.onresize = (e)=> { this._resize( this.container.clientWidth, this.container.clientHeight ); };
        this._initRenderer();
        this._initScene();
        this._initCamera();

        this._addLights();

        this._addUnions();

        requestAnimationFrame( () => { this._animate(); } );
    }

    _initRenderer() {
        this.renderer = new WebGLRenderer( { antialias: true, alpha: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
        this.container.appendChild( this.renderer.domElement );

        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ReinhardToneMapping;
        this.renderer.toneMappingExposure = 3;
    }

    _initScene() {
        this.scene = new Scene();
    }

    _initCamera() {
        this.camera = new PerspectiveCamera( 45, this.container.clientWidth / this.container.clientHeight, 1, 40000 );
        this.controls = new OrbitControls(this.camera, this.renderer.domElement );
        this.camera.position.z =12600;
    }

    _resize( width, height ) {
        this.renderer.setSize( width, height );
    }

    _addLights() {
        this.scene.add( new AmbientLight('white', 1) );
    }

    _addUnions() {

        //union from -5000,5000,0 to 5000,-5000,0
        /*
            1   2   3
            4   5   6
            7   8   9
        */


        this.unions = new Group();
        this.unions.textVector = new Vector3(); 
        let unionsize = 100;
        let geometry = new BoxBufferGeometry( unionsize, unionsize, unionsize, 1, 1, 1 );
        let material = new MeshBasicMaterial( { color: 0xff0000 } );
        
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                let m = new Mesh( geometry, material );
                m.name = 'union' + j * 3 + i;
                m.position.set(-5000 + i*5000,5000 - j*5000, 0);    //position
                let text = document.createElement('div');
                text.id = m.name;
                text.innerText = j * 3 + i;
                text.style.position = 'fixed';
                text.style.display = 'none';
                m.text = text;

                this.unions.add( m );
                document.body.appendChild( text );
            }
        }
        
        this.scene.add( this.unions );
    }
    
    _animate() {

        requestAnimationFrame( () => { this._animate(); } );

        this.renderer.render( this.scene, this.camera );

        this._updateTextPositions();
    }

    _updateTextPositions() {

        var rect = this.container.getBoundingClientRect();        
        let _widthHalf = this.container.clientWidth / 2;
		let _heightHalf = this.container.clientHeight / 2;
        let display = rect.width !== 0 ? 'block' : 'none';

        for (let i = 0; i < this.unions.children.length; i++) {
            const union = this.unions.children[i];

            this.unions.textVector.setFromMatrixPosition( union.matrixWorld );
			this.unions.textVector.project( this.camera );
            
            this.unions.textVector.x = ( this.unions.textVector.x + 1) * _widthHalf;
            this.unions.textVector.y = - ( this.unions.textVector.y - 1) * _heightHalf;
            this.unions.textVector.z = 0;

			union.text.style.left = `${rect.left + this.unions.textVector.x}px`;
			union.text.style.top = `${rect.top + this.unions.textVector.y}px`;

            union.text.style.display = display;
        }
    }
}