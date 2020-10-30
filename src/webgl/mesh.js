import vertexShader from '../shaders/vertexshader.vert';
import fragmentShader from '../shaders/fragmentshader.frag';

export default class Mesh {
    constructor(stage) {

        // スクリーンサイズに下記のサイズを乗算したサイズがスクリーンに描画されるMeshのサイズとなる
        this.meshWindowSizeRatio = { x: 1.0, y: 1.0 };

        // ジオメトリー生成用のパラメータ
        this.geometryParm = {
            width: 1.0, // ジオメトリ生成後、リサイズによるmeshのサイズ変更を見越して、1で固定、サイズの変更はmeshのscaleプロパティを変更して行う
            height: 1.0, // ジオメトリ生成後、リサイズによるmeshのサイズ変更を見越して、1で固定、サイズの変更はmeshのscaleプロパティを変更して行う
            widthSegments: 1.0, // 板ポリゴン内のセルの数（X軸）
            heightSegments: 1.0 // 板ポリゴン内のセルの数（Y軸）
        };

        // マテリアル生成用のパラメータ
        this.materialParam = {
            useWireframe: false,
        };

        this.path_01 = '/dist/images/img01.png';
        this.path_02 = '/dist/images/img02.png';
        this.path_03 = '/dist/images/noise02.jpg';
        this.imageDistLevel = 0.0;
        this.noiseLevel = 0.0;

        // マテリアル（シェーダの中）で使用するユニフォーム変数
        this.uniforms = {
            u_texture_01: { type: "t", value: new THREE.TextureLoader().load(this.path_01) },
            u_texture_02: { type: "t", value: new THREE.TextureLoader().load(this.path_02) },
            u_noise_texture: { type: "t", value: new THREE.TextureLoader().load(this.path_03) },
            u_meshsize: { type: "v2", value: { x: window.innerWidth, y: window.innerHeight } },
            u_texturesize: { type: "v2", value: { x: 1919, y: 906 } },
            imageDistLevel: { type: "f", value: this.imageDistLevel },
            noiseLevel: { type: "f", value: this.imageDistLevel },
        };

        this.stage = stage;

        this.mesh = null; // mesh

        // スクリーンサイズ
        this.windowWidth = 0;
        this.windowHeight = 0;

        // スクリーンサイズの半分
        this.windowWidthHalf = 0;
        this.windowHeightHalf = 0;

        // メッシュサイズの半分（今回は、たまたまスクリーンサイズと同じなので同様の値になる）
        this.meshWidthHalf = 0;
        this.meshHeightHalf = 0;
    }

    init() {
        this._setWindowSize(); // windowのサイズをセット
        this._setMesh(); // meshの生成
        this._setGui();
        this._setMeshScale(); // meshのサイズをセット
    }

    _setWindowSize() {
        // スクリーンサイズ
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        // スクリーンサイズの半分
        this.windowWidthHalf = this.windowWidth * 0.5;
        this.windowHeightHalf = this.windowHeight * 0.5;
    }

    _setMesh() {
        // ジオメトリーを生成
        const geometry = new THREE.PlaneBufferGeometry(
            this.geometryParm.width,
            this.geometryParm.height,
            this.geometryParm.widthSegments,
            this.geometryParm.heightSegments
        );

        // マテリアルを生成
        const material = new THREE.RawShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            wireframe: this.materialParam.useWireframe,
            transparent: true,
            uniforms: this.uniforms
        });

        this.mesh = new THREE.Mesh(geometry, material);

        this.stage.scene.add(this.mesh);
    }

    _setMeshScale() {
        // three.jsのobject3d classがもつscaleプロパティでメッシュのサイズを変更する
        this.mesh.scale.x = window.innerWidth * this.meshWindowSizeRatio.x;
        this.mesh.scale.y = window.innerHeight * this.meshWindowSizeRatio.y;

        // 同様の値をシェーダー側でも使いたいのでuniform変数に入れておく
        this.uniforms.u_meshsize.value.x = this.mesh.scale.x;
        this.uniforms.u_meshsize.value.y = this.mesh.scale.y;

        // メッシュサイズの半分（今回は、たまたまスクリーンサイズと同じなので同様の値になる）
        this.meshWidthHalf = this.mesh.scale.x * 0.5;
        this.meshHeightHalf = this.mesh.scale.y * 0.5;
    }

    _setMeshPosition() {
        // ポジションを計算して、three.jsのobject3d classがもつpositionプロパティでメッシュの座標を変更する
        // this.mesh.position.y = this.windowHeightHalf - this.meshHeightHalf;
        // this.mesh.position.x = -this.windowWidthHalf + this.meshWidthHalf;
    }

    _setGui() {
        const parameter = {
            imageDistLevel: this.imageDistLevel,
            noiseLevel: this.noiseLevel,
        };
        const gui = new dat.GUI();
        gui.add(parameter, 'imageDistLevel', 0.0, 1.0, 0.1).onChange((value) => {
            this.mesh.material.uniforms.imageDistLevel.value = value;
        });
        gui.add(parameter, 'noiseLevel', 0.0, 1.0, 0.1).onChange((value) => {
            this.mesh.material.uniforms.noiseLevel.value = value;
        });
    }

    _render() {
        // this.uniforms.u_time.value += 0.01;
    }

    onResize() {
        this._setWindowSize(); // windowのサイズをセット
        this._setMeshScale(); // meshのサイズをセット
    }

    onMouseMove(e) {
        this.uniforms.u_mouse.value.x = e.clientX;
        this.uniforms.u_mouse.value.y = e.clientY;
    }

    onRaf() {
        if (this.mesh) this._setMeshPosition();
        this._render();
    }
}