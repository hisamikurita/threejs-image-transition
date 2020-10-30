import Stage from './webgl/stage';
import Mesh from './webgl/mesh';

(() => {
    const stage = new Stage();
    stage.init();

    const mesh = new Mesh(stage);
    mesh.init();

    window.addEventListener('mousemove', (e) => {
        mesh.onMouseMove(e)
    });

    window.addEventListener('resize', () => {
        stage.onResize();;
        mesh.onResize()
    });

    const _raf = () => {
        window.requestAnimationFrame(() => {
            stage.onRaf();
            mesh.onRaf();

            _raf();
        });
    }

    _raf();
})();
