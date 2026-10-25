/* ═══════════════════════════════════════════════════════════
   CREDENTIALS SECTION - CONTROLLER
   Interactive 3D Card Hover & Dynamic Milestones
   ═══════════════════════════════════════════════════════════ */
window.CredentialsSystem = (() => {
    'use strict';

    const init = () => {
        initTiltCards();
    };

    /**
     * Subtle 3D Tilt interaction on cards
     */
    const initTiltCards = () => {
        const cards = document.querySelectorAll('.credentials-shell .cred-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    return {
        init
    };
})();
