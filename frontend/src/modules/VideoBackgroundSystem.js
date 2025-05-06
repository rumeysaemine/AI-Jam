// src/modules/VideoBackgroundSystem.js

export class VideoBackgroundSystem {
    constructor() {
      this.video = document.querySelector('.video-background video');
      this.aspectRatio = 16 / 9;
      this.init();
    }
  
    init() {
      if (this.video) {
        this.video.addEventListener('loadeddata', () => this.adjustSize());
        this.video.addEventListener('error', () => this.handleVideoError());
        this.adjustSize();
      }
      window.addEventListener('resize', () => this.adjustSize());
    }
  
    adjustSize() {
      if (!this.video) return;
      
      if (window.innerWidth / window.innerHeight > this.aspectRatio) {
        // Geniş ekranlarda
        this.video.style.width = '100%';
        this.video.style.height = 'auto';
      } else {
        // Dikey ekranlarda
        this.video.style.width = 'auto';
        this.video.style.height = '100%';
      }
    }
  
  }