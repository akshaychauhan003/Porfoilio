/**
 * ════════════════════════════════════════════════════════════════
 * ARCHITECT CONSOLE — MOBILE ADMIN DASHBOARD CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // State
    const state = {
        activeTab: 'messages',
        messages: [],
        reviews: [],
        experiences: [],
        projects: [],
        unreadCount: 0,
        pendingReviewCount: 0,
        installPrompt: null
    };

    // DOM Elements
    const elements = {
        syncDot: document.getElementById('sync-status-dot'),
        syncText: document.getElementById('sync-status-text'),
        notifBadge: document.getElementById('notif-badge'),
        notifBar: document.getElementById('notif-permission-bar'),
        enableNotifsBtn: document.getElementById('enable-notifs-btn'),
        navInboxBadge: document.getElementById('nav-inbox-badge'),
        navReviewsBadge: document.getElementById('nav-reviews-badge'),
        messagesContainer: document.getElementById('messages-container'),
        pendingReviewsContainer: document.getElementById('pending-reviews-container'),
        approvedReviewsContainer: document.getElementById('approved-reviews-container'),
        pendingReviewsCount: document.getElementById('pending-reviews-count'),
        approvedReviewsCount: document.getElementById('approved-reviews-count'),
        experiencesContainer: document.getElementById('experiences-container'),
        projectsContainer: document.getElementById('projects-container'),
        toast: document.getElementById('dash-toast'),

        // Modals & Forms
        settingsModal: document.getElementById('settings-modal'),
        settingsForm: document.getElementById('settings-form'),
        expModal: document.getElementById('exp-modal'),
        expForm: document.getElementById('exp-form'),
        projModal: document.getElementById('proj-modal'),
        projForm: document.getElementById('proj-form'),
    };

    // Audio chime for new notifications
    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch {}
    };

    // Show Toast
    const showToast = (message) => {
        if (!elements.toast) return;
        elements.toast.textContent = message;
        elements.toast.classList.add('show');
        setTimeout(() => elements.toast.classList.remove('show'), 3000);
    };

    // ─────────────────────────────────────────────────────────────
    // 1. PWA SERVICE WORKER & NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────
    const initPWA = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('[PWA] Service Worker registered:', reg.scope);
                })
                .catch(err => {
                    console.warn('[PWA] Service Worker registration failed:', err);
                });
        }

        // Catch Android beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.installPrompt = e;
            showToast('Tap Settings to install dashboard app on your phone');
        });

        // Check Notification Permission
        if ('Notification' in window) {
            if (Notification.permission === 'default' && elements.notifBar) {
                elements.notifBar.style.display = 'flex';
            }
        }

        if (elements.enableNotifsBtn) {
            elements.enableNotifsBtn.addEventListener('click', async () => {
                if ('Notification' in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                        elements.notifBar.style.display = 'none';
                        showToast('Push Notifications Enabled ✓');
                        triggerNotification('Notifications Active', 'You will receive real-time alerts for new client inquiries.');
                    }
                }
            });
        }
    };

    const triggerNotification = (title, body) => {
        playNotificationSound();
        if ('Notification' in window && Notification.permission === 'granted') {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIF', title, body });
            } else {
                new Notification(title, { body, icon: 'icon.png' });
            }
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 2. DATA LOAD & RENDER
    // ─────────────────────────────────────────────────────────────
    const loadAllData = async () => {
        try {
            // Update sync status indicator
            if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) {
                elements.syncDot.style.background = 'var(--accent-green)';
                elements.syncText.textContent = 'PostgreSQL Cloud Synced';
            } else {
                elements.syncDot.style.background = '#fbbf24';
                elements.syncText.textContent = 'Local Store (Configure Supabase)';
            }

            // Fetch concurrently
            const [messages, reviews, experiences, projects] = await Promise.all([
                window.PortfolioData.getMessages(),
                window.PortfolioData.getAllReviews(),
                window.PortfolioData.getExperiences(),
                window.PortfolioData.getProjects()
            ]);

            state.messages = messages || [];
            state.reviews = reviews || [];
            state.experiences = experiences || [];
            state.projects = projects || [];

            renderMessages();
            renderReviews();
            renderExperiences();
            renderProjects();
            updateBadges();
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            showToast('Sync error. Retrying with local cache.');
        }
    };

    const updateBadges = () => {
        state.unreadCount = state.messages.filter(m => !m.is_read).length;
        state.pendingReviewCount = state.reviews.filter(r => r.status === 'pending').length;

        // Header bell badge
        const totalAlerts = state.unreadCount + state.pendingReviewCount;
        elements.notifBadge.textContent = totalAlerts;
        elements.notifBadge.style.display = totalAlerts > 0 ? 'flex' : 'none';

        // Bottom nav badges
        elements.navInboxBadge.textContent = state.unreadCount;
        elements.navInboxBadge.style.display = state.unreadCount > 0 ? 'flex' : 'none';

        elements.navReviewsBadge.textContent = state.pendingReviewCount;
        elements.navReviewsBadge.style.display = state.pendingReviewCount > 0 ? 'flex' : 'none';

        elements.pendingReviewsCount.textContent = state.pendingReviewCount;
        elements.approvedReviewsCount.textContent = state.reviews.filter(r => r.status === 'approved').length;
    };

    // Format Date Helper
    const formatDate = (isoString) => {
        if (!isoString) return 'Just now';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return isoString;
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 3. TAB 1: MESSAGES (CONTACT + HIRE INQUIRIES)
    // ─────────────────────────────────────────────────────────────
    const renderMessages = () => {
        if (!elements.messagesContainer) return;
        if (state.messages.length === 0) {
            elements.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📬</div>
                    <p>No inquiries yet. Submissions from your portfolio contact form will appear here in real-time.</p>
                </div>`;
            return;
        }

        elements.messagesContainer.innerHTML = state.messages.map(msg => `
            <div class="card-item ${!msg.is_read ? 'unread' : ''}" data-msg-id="${msg.id}">
                <div class="card-header-row">
                    <div>
                        <div class="card-sender-name">${escapeHTML(msg.name)}</div>
                        <div class="card-sender-company">${msg.company ? escapeHTML(msg.company) : 'Independent / Direct'}</div>
                    </div>
                    <div class="card-time">${formatDate(msg.created_at)}</div>
                </div>

                <div class="card-meta-line">
                    <span class="card-meta-pill">✉ ${escapeHTML(msg.email)}</span>
                    ${msg.website ? `<a href="${formatUrl(msg.website)}" target="_blank" rel="noopener" class="card-meta-pill">🌐 ${escapeHTML(msg.website)}</a>` : ''}
                    ${msg.source === 'hire_now_click' ? `<span class="card-meta-pill" style="color:var(--accent-gold);">⚡ "Hire Now" Flow</span>` : ''}
                </div>

                <div class="card-body-text">${escapeHTML(msg.message)}</div>

                <div class="card-actions-row">
                    ${!msg.is_read ? `<button class="card-btn mark-read" onclick="window.ConsoleApp.markRead('${msg.id}')">✓ Mark Read</button>` : ''}
                    <a href="mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent('Re: Systems Architecture Inquiry')}&body=${encodeURIComponent('Hi ' + msg.name + ',\n\nThank you for reaching out regarding your project.\n\nBest regards,\nAkshay Singh Chauhan')}" class="card-btn reply">Reply via Mail ↗</a>
                    <button class="card-btn delete" onclick="window.ConsoleApp.deleteMessage('${msg.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    };

    // ─────────────────────────────────────────────────────────────
    // 4. TAB 2: REVIEWS MODERATION (PENDING & APPROVED)
    // ─────────────────────────────────────────────────────────────
    const renderReviews = () => {
        const pending = state.reviews.filter(r => r.status === 'pending');
        const approved = state.reviews.filter(r => r.status === 'approved');

        // Render Pending
        if (elements.pendingReviewsContainer) {
            if (pending.length === 0) {
                elements.pendingReviewsContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">✓</div>
                        <p>No pending reviews. All clear!</p>
                    </div>`;
            } else {
                elements.pendingReviewsContainer.innerHTML = pending.map(rev => `
                    <div class="card-item" style="border-left: 4px solid #fbbf24;">
                        <div class="card-header-row">
                            <div>
                                <div class="card-sender-name">${escapeHTML(rev.client_name)}</div>
                                <div class="card-sender-company">${escapeHTML(rev.client_title || '')} ${rev.client_company ? '· ' + escapeHTML(rev.client_company) : ''}</div>
                            </div>
                            <span class="counter-badge warning">Pending Approval</span>
                        </div>

                        <div class="stars-row">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
                        <div class="card-body-text">${escapeHTML(rev.review_text)}</div>

                        <div class="card-actions-row">
                            <button class="card-btn approve" onclick="window.ConsoleApp.approveReview('${rev.id}')">✓ Approve (Publish to Portfolio)</button>
                            <button class="card-btn delete" onclick="window.ConsoleApp.rejectReview('${rev.id}')">Reject</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Approved
        if (elements.approvedReviewsContainer) {
            if (approved.length === 0) {
                elements.approvedReviewsContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No approved reviews live yet.</p>
                    </div>`;
            } else {
                elements.approvedReviewsContainer.innerHTML = approved.map(rev => `
                    <div class="card-item" style="border-left: 4px solid var(--accent-green);">
                        <div class="card-header-row">
                            <div>
                                <div class="card-sender-name">${escapeHTML(rev.client_name)}</div>
                                <div class="card-sender-company">${escapeHTML(rev.client_title || '')} ${rev.client_company ? '· ' + escapeHTML(rev.client_company) : ''}</div>
                            </div>
                            <span class="counter-badge success">Live on Portfolio</span>
                        </div>

                        <div class="stars-row">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
                        <div class="card-body-text">${escapeHTML(rev.review_text)}</div>

                        <div class="card-actions-row">
                            <button class="card-btn" onclick="window.ConsoleApp.unpublishReview('${rev.id}')">Unpublish</button>
                            <button class="card-btn delete" onclick="window.ConsoleApp.deleteReview('${rev.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 5. TAB 3: HORIZONTAL EXPERIENCE MANAGER
    // ─────────────────────────────────────────────────────────────
    const renderExperiences = () => {
        if (!elements.experiencesContainer) return;
        if (state.experiences.length === 0) {
            elements.experiencesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💼</div>
                    <p>No experiences listed. Add your first role using the button above.</p>
                </div>`;
            return;
        }

        elements.experiencesContainer.innerHTML = state.experiences.map(exp => `
            <div class="card-item">
                <div class="card-header-row">
                    <div>
                        <div class="card-sender-name">${escapeHTML(exp.role)}</div>
                        <div class="card-sender-company">${escapeHTML(exp.company)} ${exp.location ? '· ' + escapeHTML(exp.location) : ''}</div>
                    </div>
                    <span class="card-meta-pill">${escapeHTML(exp.duration)}</span>
                </div>

                <div class="card-body-text">${escapeHTML(exp.description)}</div>

                <div class="card-actions-row">
                    <button class="card-btn" onclick="window.ConsoleApp.editExperience('${exp.id}')">Edit</button>
                    <button class="card-btn delete" onclick="window.ConsoleApp.deleteExperience('${exp.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    };

    // ─────────────────────────────────────────────────────────────
    // 6. TAB 4: PROJECTS SHOWCASE MANAGER
    // ─────────────────────────────────────────────────────────────
    const renderProjects = () => {
        if (!elements.projectsContainer) return;
        if (state.projects.length === 0) {
            elements.projectsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚀</div>
                    <p>No projects listed. Add a new project with video preview and live link.</p>
                </div>`;
            return;
        }

        elements.projectsContainer.innerHTML = state.projects.map(proj => {
            const tags = Array.isArray(proj.tech_stack) ? proj.tech_stack : (proj.tech_stack || '').split(',').map(s => s.trim());
            return `
                <div class="card-item">
                    <div class="card-header-row">
                        <div>
                            <div class="card-sender-name">${escapeHTML(proj.title)}</div>
                            <div class="card-sender-company">${escapeHTML(proj.category || 'Engineering')}</div>
                        </div>
                        ${proj.live_url ? `<a href="${proj.live_url}" target="_blank" rel="noopener" class="card-btn reply">Visit Site ↗</a>` : ''}
                    </div>

                    <div class="tags-wrap">
                        ${tags.filter(Boolean).map(t => `<span class="tech-tag-pill">${escapeHTML(t)}</span>`).join('')}
                    </div>

                    <div class="card-body-text">${escapeHTML(proj.description)}</div>

                    ${proj.video_url ? `<div class="card-meta-line"><span class="card-meta-pill">🎬 Video Preview: ${escapeHTML(proj.video_url)}</span></div>` : ''}

                    <div class="card-actions-row">
                        <button class="card-btn" onclick="window.ConsoleApp.editProject('${proj.id}')">Edit</button>
                        <button class="card-btn delete" onclick="window.ConsoleApp.deleteProject('${proj.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Helper sanitization
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    };

    const formatUrl = (url) => {
        if (!url) return '#';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    };

    // ─────────────────────────────────────────────────────────────
    // 7. EVENT LISTENERS & TAB NAVIGATION
    // ─────────────────────────────────────────────────────────────
    const setupEvents = () => {
        // Tab switching
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                const targetPane = document.getElementById(`pane-${tab}`);
                if (targetPane) targetPane.classList.add('active');
                state.activeTab = tab;
            });
        });

        // Refresh buttons
        const refMsg = document.getElementById('refresh-messages-btn');
        if (refMsg) refMsg.addEventListener('click', () => { loadAllData(); showToast('Inquiries refreshed'); });
        const refRev = document.getElementById('refresh-reviews-btn');
        if (refRev) refRev.addEventListener('click', () => { loadAllData(); showToast('Reviews refreshed'); });

        // Modal triggers
        document.getElementById('settings-btn')?.addEventListener('click', () => openModal('settings-modal'));
        document.getElementById('add-exp-btn')?.addEventListener('click', () => {
            elements.expForm.reset();
            document.getElementById('exp-id').value = '';
            document.getElementById('exp-modal-title').textContent = 'Add Career Milestone';
            openModal('exp-modal');
        });
        document.getElementById('add-proj-btn')?.addEventListener('click', () => {
            elements.projForm.reset();
            document.getElementById('proj-id').value = '';
            document.getElementById('proj-modal-title').textContent = 'Add Portfolio Project';
            openModal('proj-modal');
        });

        // Close modal buttons
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-close-modal');
                closeModal(id);
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.dash-modal').forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) closeModal(m.id);
            });
        });

        // Settings Form Submit
        if (elements.settingsForm) {
            // Pre-fill existing config
            const urlInput = document.getElementById('cfg-supabase-url');
            const keyInput = document.getElementById('cfg-supabase-key');
            if (urlInput) urlInput.value = localStorage.getItem('portfolio_supabase_url') || '';
            if (keyInput) keyInput.value = localStorage.getItem('portfolio_supabase_anon_key') || '';

            elements.settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const url = document.getElementById('cfg-supabase-url').value.trim();
                const key = document.getElementById('cfg-supabase-key').value.trim();
                const emailService = document.getElementById('cfg-emailjs-service')?.value.trim();
                const emailTemplate = document.getElementById('cfg-emailjs-template')?.value.trim();

                localStorage.setItem('portfolio_supabase_url', url);
                localStorage.setItem('portfolio_supabase_anon_key', key);
                if (emailService) localStorage.setItem('portfolio_emailjs_service_id', emailService);
                if (emailTemplate) localStorage.setItem('portfolio_emailjs_template_id', emailTemplate);

                window.SUPABASE_CONFIG.url = url;
                window.SUPABASE_CONFIG.anonKey = key;

                closeModal('settings-modal');
                showToast('Settings saved ✓ Re-syncing database...');
                loadAllData();
            });
        }

        // Experience Form Submit
        if (elements.expForm) {
            elements.expForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('exp-id').value || ('exp-' + Date.now());
                const role = document.getElementById('exp-role').value.trim();
                const company = document.getElementById('exp-company').value.trim();
                const location = document.getElementById('exp-location').value.trim();
                const duration = document.getElementById('exp-duration').value.trim();
                const description = document.getElementById('exp-desc').value.trim();

                const exp = { id, role, company, location, duration, description, order_index: state.experiences.length + 1 };
                await window.PortfolioData.saveExperience(exp);
                closeModal('exp-modal');
                showToast('Experience milestone saved to timeline ✓');
                loadAllData();
            });
        }

        // Project Form Submit
        if (elements.projForm) {
            elements.projForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('proj-id').value || ('proj-' + Date.now());
                const title = document.getElementById('proj-title').value.trim();
                const category = document.getElementById('proj-category').value.trim();
                const techInput = document.getElementById('proj-tech').value.trim();
                const live_url = document.getElementById('proj-live-url').value.trim();
                const video_url = document.getElementById('proj-video-url').value.trim();
                const description = document.getElementById('proj-desc').value.trim();

                const tech_stack = techInput.split(',').map(s => s.trim()).filter(Boolean);
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                const proj = {
                    id,
                    slug,
                    title,
                    category,
                    tech_stack,
                    live_url,
                    video_url,
                    description,
                    preview_type: video_url ? 'video' : 'surface',
                    is_active: true,
                    order_index: state.projects.length + 1
                };

                await window.PortfolioData.saveProject(proj);
                closeModal('proj-modal');
                showToast('Project saved with video & links ✓');
                loadAllData();
            });
        }
    };

    const openModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
    };

    const closeModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    };

    // ─────────────────────────────────────────────────────────────
    // 8. PUBLIC EXPOSED ACTIONS (Called from UI inline onclicks)
    // ─────────────────────────────────────────────────────────────
    window.ConsoleApp = {
        async markRead(id) {
            await window.PortfolioData.markMessageRead(id);
            const msg = state.messages.find(m => m.id === id);
            if (msg) msg.is_read = true;
            renderMessages();
            updateBadges();
            showToast('Marked as read');
        },

        async deleteMessage(id) {
            if (!confirm('Delete this message?')) return;
            await window.PortfolioData.deleteMessage(id);
            state.messages = state.messages.filter(m => m.id !== id);
            renderMessages();
            updateBadges();
            showToast('Message deleted');
        },

        async approveReview(id) {
            await window.PortfolioData.updateReviewStatus(id, 'approved');
            const rev = state.reviews.find(r => r.id === id);
            if (rev) rev.status = 'approved';
            renderReviews();
            updateBadges();
            showToast('Review approved & published to portfolio ✓');
        },

        async rejectReview(id) {
            if (!confirm('Reject and delete this review?')) return;
            await window.PortfolioData.deleteReview(id);
            state.reviews = state.reviews.filter(r => r.id !== id);
            renderReviews();
            updateBadges();
            showToast('Review rejected');
        },

        async unpublishReview(id) {
            await window.PortfolioData.updateReviewStatus(id, 'pending');
            const rev = state.reviews.find(r => r.id === id);
            if (rev) rev.status = 'pending';
            renderReviews();
            updateBadges();
            showToast('Review unpublished (moved to pending)');
        },

        async deleteReview(id) {
            if (!confirm('Permanently delete review?')) return;
            await window.PortfolioData.deleteReview(id);
            state.reviews = state.reviews.filter(r => r.id !== id);
            renderReviews();
            updateBadges();
            showToast('Review deleted');
        },

        editExperience(id) {
            const exp = state.experiences.find(e => e.id === id);
            if (!exp) return;
            document.getElementById('exp-id').value = exp.id;
            document.getElementById('exp-role').value = exp.role;
            document.getElementById('exp-company').value = exp.company;
            document.getElementById('exp-location').value = exp.location || '';
            document.getElementById('exp-duration').value = exp.duration;
            document.getElementById('exp-desc').value = exp.description;
            document.getElementById('exp-modal-title').textContent = 'Edit Career Milestone';
            openModal('exp-modal');
        },

        async deleteExperience(id) {
            if (!confirm('Remove this experience from your portfolio timeline?')) return;
            await window.PortfolioData.deleteExperience(id);
            state.experiences = state.experiences.filter(e => e.id !== id);
            renderExperiences();
            showToast('Experience removed');
        },

        editProject(id) {
            const proj = state.projects.find(p => p.id === id);
            if (!proj) return;
            document.getElementById('proj-id').value = proj.id;
            document.getElementById('proj-title').value = proj.title;
            document.getElementById('proj-category').value = proj.category || '';
            const tech = Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : (proj.tech_stack || '');
            document.getElementById('proj-tech').value = tech;
            document.getElementById('proj-live-url').value = proj.live_url || '';
            document.getElementById('proj-video-url').value = proj.video_url || '';
            document.getElementById('proj-desc').value = proj.description;
            document.getElementById('proj-modal-title').textContent = 'Edit Project';
            openModal('proj-modal');
        },

        async deleteProject(id) {
            if (!confirm('Remove this project from your portfolio?')) return;
            await window.PortfolioData.deleteProject(id);
            state.projects = state.projects.filter(p => p.id !== id);
            renderProjects();
            showToast('Project removed');
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 9. BOOTSTRAP & PERIODIC LIVE POLLING
    // ─────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        initPWA();
        setupEvents();
        loadAllData();

        // Check for new incoming messages every 15 seconds
        setInterval(async () => {
            const prevMsgCount = state.messages.length;
            const prevPendingReviews = state.reviews.filter(r => r.status === 'pending').length;

            const [latestMsgs, latestReviews] = await Promise.all([
                window.PortfolioData.getMessages(),
                window.PortfolioData.getAllReviews()
            ]);

            if (latestMsgs && latestMsgs.length > prevMsgCount) {
                const newest = latestMsgs[0];
                triggerNotification('New Portfolio Message 📬', `${newest.name} from ${newest.company || 'Direct'} sent an inquiry.`);
                state.messages = latestMsgs;
                renderMessages();
                updateBadges();
            }

            if (latestReviews) {
                const currentPending = latestReviews.filter(r => r.status === 'pending').length;
                if (currentPending > prevPendingReviews) {
                    triggerNotification('New Client Review ⭐', 'A client has submitted a review pending your approval.');
                    state.reviews = latestReviews;
                    renderReviews();
                    updateBadges();
                }
            }
        }, 15000);
    });

})();
