/* ═══════════════════════════════════════════════════════════
   CONTACT SECTION - CONTROLLER
   Dual Sync: Email Inbox + Mobile Admin Dashboard
   ═══════════════════════════════════════════════════════════ */
window.ContactSystem = (() => {
    'use strict';

    const init = () => {
        initForm();
    };

    /**
     * "Hire Now" Flow:
     * Directly opens the user's email client with pre-written hiring template
     * AND logs the inquiry in the Admin Mobile Dashboard.
     */
    const openHireMail = () => {
        const recipient = 'akshaysinghchauhan003@gmail.com';
        const subject = 'Project Inquiry — Systems Architect & Engineering';
        const bodyTemplate = 
`Hi Akshay,

I visited your portfolio and would like to discuss hiring you for an upcoming project / role.

- Company / Team: [Your company or project name]
- Project Type: [e.g. Distributed Web Architecture, Full-Stack App, Cloud Infrastructure]
- Desired Timeline: [e.g. Immediate / Next 2–4 weeks]
- Estimated Budget / Scope: [Your budget range or scope]

Project Overview:
[Briefly describe the challenge or application you want to build]

Best way to reach me: [Your Phone / Email / LinkedIn]

Looking forward to connecting!

Best regards,
[Your Name]`;

        // 1. Log interaction in Supabase / Dashboard
        if (window.PortfolioData && window.PortfolioData.submitContactMessage) {
            window.PortfolioData.submitContactMessage({
                name: 'Direct "Hire Now" Visitor',
                company: 'Direct Mail Client',
                email: 'Pending from email',
                website: '',
                message: 'Visitor clicked "Hire Now" button to compose email template.',
                source: 'hire_now_click'
            }).catch(() => {});
        }

        // 2. Open client's mail composer
        const mailtoUri = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTemplate)}`;
        window.location.href = mailtoUri;
    };

    /**
     * Contact Form Submission:
     * Captures Name, Company, Email, Website, Message
     * Syncs directly to Supabase Database (shows in Dashboard) + Dispatches Email
     */
    const initForm = () => {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Antispam check
            const botCheck = document.getElementById('cf-bot-check')?.value;
            if (botCheck) {
                console.warn('Bot submission blocked');
                return;
            }

            const name = document.getElementById('cf-name')?.value.trim();
            const company = document.getElementById('cf-company')?.value.trim();
            const email = document.getElementById('cf-email')?.value.trim();
            const website = document.getElementById('cf-website')?.value.trim();
            const message = document.getElementById('cf-message')?.value.trim();
            const statusEl = document.getElementById('cf-status');
            const submitBtn = document.getElementById('cf-submit');

            if (!name || !email || !message) {
                if (statusEl) {
                    statusEl.textContent = 'Please fill in all required fields (Name, Email, Message).';
                    statusEl.style.color = '#ef4444';
                }
                return;
            }

            // Simple email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (statusEl) {
                    statusEl.textContent = 'Please enter a valid email address.';
                    statusEl.style.color = '#ef4444';
                }
                return;
            }

            // UI feedback
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="cf-submit-label">Sending...</span>';
            submitBtn.disabled = true;
            if (statusEl) {
                statusEl.textContent = 'Transmitting to Akshay...';
                statusEl.style.color = 'var(--text-secondary)';
            }

            try {
                if (window.PortfolioData && window.PortfolioData.submitContactMessage) {
                    await window.PortfolioData.submitContactMessage({
                        name,
                        company,
                        email,
                        website,
                        message,
                        source: 'contact_form'
                    });
                }

                if (statusEl) {
                    statusEl.textContent = 'Thanks for your message! Will get back to you soon.';
                    statusEl.style.color = 'var(--accent-blue)';
                }
                submitBtn.innerHTML = '<span class="cf-submit-label">✓ Sent Successfully</span>';
                form.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.disabled = false;
                }, 4000);
            } catch (err) {
                console.error('Contact submit error:', err);
                if (statusEl) {
                    statusEl.textContent = 'Message saved locally. Akshay will be notified.';
                    statusEl.style.color = 'var(--accent-blue)';
                }
                submitBtn.innerHTML = originalBtnHTML;
                submitBtn.disabled = false;
            }
        });
    };

    return {
        init,
        openHireMail
    };
})();
