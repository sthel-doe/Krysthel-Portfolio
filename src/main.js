import '../css/style.css';
import './colorBends.css';
import './portfolio.js';
import './projectDetail.js';

/* WebGL (three + ogl) in separate async chunks — keeps the main bundle smaller. */
void (async () => {
  const [{ initSplashAurora }, { initColorBends }] = await Promise.all([
    import('./splashAurora.js'),
    import('./colorBends.js'),
  ]);

  initSplashAurora(document.getElementById('splash-aurora'), {
    colorStops: ['#7cff67', '#B19EEF', '#5227FF'],
    blend: 0.5,
    amplitude: 1.0,
    speed: 1,
  });

  const aurora = document.getElementById('aurora-bg');
  if (aurora) {
    initColorBends(aurora, {
      colors: ['#ff5c7a', '#8a5cff', '#00ffd1'],
      rotation: 0,
      speed: 0.2,
      scale: 1,
      frequency: 1,
      warpStrength: 1,
      mouseInfluence: 1,
      parallax: 0.5,
      noise: 0.1,
      transparent: true,
      autoRotate: 0,
    });
  }
})();
