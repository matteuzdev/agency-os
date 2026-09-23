/**
 * GRANFINI MÁRMORES & GRANITOS — MOTION & INTERACTIVITY V2.0
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. MOBILE DRAWER NAVIGATION
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ==========================================
  // 2. SELETOR INTERATIVO DE MATERIAIS (TABS)
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      button.classList.add('active');
      const targetPane = document.getElementById(`pane-${targetId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // ==========================================
  // 3. SLIDER ANTES & DEPOIS (DRAGGABLE & TOUCH)
  // ==========================================
  const sliderContainer = document.getElementById('beforeAfterSlider');
  const overlay = document.getElementById('compOverlay');
  const handle = document.getElementById('compHandle');

  if (sliderContainer && overlay && handle) {
    let isDragging = false;

    const updateSlider = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      let position = ((clientX - rect.left) / rect.width) * 100;
      
      // Limites entre 5% e 95%
      position = Math.max(5, Math.min(position, 95));

      overlay.style.width = `${position}%`;
      handle.style.left = `${position}%`;
    };

    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    // Suporte a Touch em Smartphones (iOS e Android)
    sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: true });
  }

  // ==========================================
  // 4. FAQ ACORDEÃO INTERATIVO
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(i => i.classList.remove('active'));

        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ==========================================
  // 5. NAVBAR INTERATIVA COM SCROLL
  // ==========================================
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbarWrapper.style.boxShadow = '0 10px 30px rgba(10, 25, 49, 0.08)';
      navbarWrapper.style.background = 'rgba(250, 248, 245, 0.96)';
    } else {
      navbarWrapper.style.boxShadow = 'none';
      navbarWrapper.style.background = 'rgba(250, 248, 245, 0.9)';
    }
  });

});
