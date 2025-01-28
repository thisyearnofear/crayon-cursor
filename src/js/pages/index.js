import '../../styles/index.scss';
import '../../styles/pages/index.scss';
import CanvasManager from '../components/canvas-manager';

export default class Index {
  constructor() {
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
    this.initGrid();
    const canvasManager = new CanvasManager();
  }
  initGrid() {
    document.addEventListener('keydown', (e) => {
      if(e.shiftKey && e.key === 'G') {
        document.getElementById('grid').classList.toggle('show')
      }
    })
  }
  resize() {
    document.documentElement.style.setProperty('--rvw', `${document.documentElement.clientWidth / 100}px`);
  }
}
window.addEventListener('load', () => {
  new Index();
});