/* ═══════════════════════════════════════════════════════════
   CLIENT REVIEW SECTION - CONTROLLER
   Dynamic Approved Reviews & Client Submission Modal
   ═══════════════════════════════════════════════════════════ */
window.ClientReviewSystem = (() => {
    'use strict';

    let isInitialized = false;
    let currentRating = 5;

    const init = () => {
        if (isInitialized) {
            return loadApprovedReviews();
        }
        isInitialized = true;

        initModalEvents();

        // Listen for reviews saved/updated anywhere (e.g. dashboard, cross-tab, or submission)
        window.addEventListener('portfolio-review-saved', () => {
            loadApprovedReviews();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolio_reviews') {
                loadApprovedReviews();
            }
        });

        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('portfolio_sync');
                bc.onmessage = (msg) => {
                    const t = msg?.data?.type;
                    if (t === 'review-saved' || t === 'review-deleted') {
                        loadApprovedReviews();
                    }
                };
            }
        } catch (_) {}

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                loadApprovedReviews();
            }
        });

        return loadApprovedReviews();
    };

    /**
     * Load & Render Approved Reviews from Supabase Data Provider
     * Dynamically calculates authentic ratings summary (no fake numbers).
     */
    const loadApprovedReviews = async () => {
        try {
            let reviews = [];
            if (window.PortfolioData && typeof window.PortfolioData.getApprovedReviews === 'function') {
                reviews = await window.PortfolioData.getApprovedReviews({ forceCloud: true });
            }
            renderReviews(reviews || []);
            computeMetrics(reviews || []);
        } catch (err) {
            console.warn('Error loading approved reviews:', err);
        }
    };

    const computeMetrics = (reviews) => {
        const avgScoreEl = document.getElementById('review-avg-score');
        const verifiedCountEl = document.getElementById('review-verified-count');
        const ratingBarsEl = document.getElementById('rating-bars');

        if (!reviews || reviews.length === 0) {
            if (avgScoreEl) avgScoreEl.textContent = '—';
            if (verifiedCountEl) verifiedCountEl.textContent = '0 Verified Client Reviews';
            if (ratingBarsEl) {
                ratingBarsEl.innerHTML = [5, 4, 3, 2, 1].map(star => `
                    <div class="rating-row">
                        <span class="r-label">${star} ★</span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" style="width: 0%;"></div>
                        </div>
                        <span class="r-pct">0%</span>
                    </div>
                `).join('');
            }
            return;
        }

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        const avg = (sum / total).toFixed(1);

        if (avgScoreEl) avgScoreEl.textContent = avg;
        if (verifiedCountEl) verifiedCountEl.textContent = `${total} Verified Client Review${total > 1 ? 's' : ''}`;

        // Compute counts per star (5 to 1)
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const star = Math.min(5, Math.max(1, Number(r.rating) || 5));
            counts[star]++;
        });

        if (ratingBarsEl) {
            ratingBarsEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
                const pct = total > 0 ? Math.round((counts[star] / total) * 100) : 0;
                return `
                    <div class="rating-row">
                        <span class="r-label">${star} ★</span>
                        <div class="rating-bar-bg">
                            <div class="rating-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                        <span class="r-pct">${pct}%</span>
                    </div>
                `;
            }).join('');
        }
    };

    const renderReviews = (reviews) => {
        const container = document.getElementById('review-cards-track');
        if (!container) return;
        if (!reviews || !reviews.length) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 48px 20px; color: var(--text-muted, #94a3b8);">
                    <p style="font-size: 1.05rem; margin-bottom: 6px;">No client reviews published yet.</p>
                    <p style="font-size: 0.85rem; opacity: 0.7;">Submitted reviews will appear here once approved in the Dashboard.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map((r, idx) => {
            const initials = escapeHTML((r.client_name || 'CL')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase());

            const starsHtml = Array.from({ length: 5 }, (_, i) => `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="${i < r.rating ? '#fbbf24' : '#4b5563'}">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            `).join('');

            let websiteUrl = (r.company_website || r.website || '').trim();
            if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                websiteUrl = 'https://' + websiteUrl;
            }

            const clientNameEsc = escapeHTML(r.client_name);
            const clientCompanyEsc = escapeHTML(r.client_company || '');
            const clientTitleEsc = escapeHTML(r.client_title || '');

            // The website URL does not appear as raw text in review; instead the name & company act as a hyperlink
            const nameHtml = websiteUrl
                ? `<a href="${escapeHTML(websiteUrl)}" target="_blank" rel="noopener noreferrer" class="rev-link rev-name-link" title="Visit ${clientCompanyEsc || clientNameEsc}">${clientNameEsc}</a>`
                : `<span class="rev-name-text">${clientNameEsc}</span>`;

            const companyHtml = websiteUrl && clientCompanyEsc
                ? `<a href="${escapeHTML(websiteUrl)}" target="_blank" rel="noopener noreferrer" class="rev-link rev-company-link" title="Visit ${clientCompanyEsc}">${clientCompanyEsc}</a>`
                : clientCompanyEsc;

            const metaLine = [clientTitleEsc, companyHtml].filter(Boolean).join(' · ');

            return `
                <div class="review-card ${idx === 0 ? 'top-review' : ''}">
                    <div class="review-header">
                        <div class="rev-avatar">${initials}</div>
                        <div class="rev-meta">
                            <div class="rev-name">${nameHtml}</div>
                            <div class="rev-company">${metaLine}</div>
                            <div class="rev-stars">
                                ${starsHtml}
                                <span style="margin-left:8px;font-family:var(--font-mono);font-size:10px;color:var(--accent-blue)">✦ Verified Client</span>
                            </div>
                        </div>
                        <span class="rev-badge">Verified Client</span>
                    </div>
                    <p class="rev-text">"${escapeHTML(r.review_text)}"</p>
                </div>
            `;
        }).join('');

        const cards = container.querySelectorAll('.review-card');
        if (window.ScrollEngine && window.ScrollEngine.observe) {
            window.ScrollEngine.observe(cards);
        }
        requestAnimationFrame(() => {
            cards.forEach(c => c.classList.add('visible'));
        });
    };

    /**
     * Review Modal & Submission Handler
     */
    const initModalEvents = () => {
        const ensureModalInBody = () => {
            const m = document.getElementById('review-modal');
            if (m && m.parentNode !== document.body) {
                document.body.appendChild(m);
            }
            return m;
        };

        const modal = ensureModalInBody();
        const openBtn = document.getElementById('open-review-modal-btn');
        const closeBtn = document.getElementById('close-review-modal-btn');
        const cancelBtn = document.getElementById('cancel-review-btn');
        const form = document.getElementById('client-review-form');

        const openModal = () => {
            const m = ensureModalInBody();
            if (m) {
                m.classList.add('open');
                m.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                document.documentElement.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';

                setTimeout(() => {
                    document.getElementById('rm-client-name')?.focus();
                }, 80);
            }
        };

        const closeModal = () => {
            const m = document.getElementById('review-modal');
            if (m) {
                m.classList.remove('open');
                m.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
                document.documentElement.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }
        };

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Prevent scroll bleed when touching/scrolling directly on backdrop
            modal.addEventListener('wheel', (e) => {
                if (e.target === modal) e.preventDefault();
            }, { passive: false });

            modal.addEventListener('touchmove', (e) => {
                if (e.target === modal) e.preventDefault();
            }, { passive: false });
        }

        window.addEventListener('keydown', (e) => {
            const m = document.getElementById('review-modal');
            if (e.key === 'Escape' && m && m.classList.contains('open')) {
                closeModal();
            }
        });

        // Star picker buttons with live description
        const starBtns = document.querySelectorAll('.star-pick-btn');
        const ratingInput = document.getElementById('review-rating-val');
        const ratingDesc = document.getElementById('rating-text-feedback');
        const starPicker = document.getElementById('star-picker');

        const ratingDescriptions = {
            5: '5.0 ★ Exceptional Architecture & Delivery',
            4: '4.0 ★ High Quality & Scalable Execution',
            3: '3.0 ★ Good Delivery, Met Expectations',
            2: '2.0 ★ Adequate with Room for Improvement',
            1: '1.0 ★ Significant Issues Encountered'
        };

        const updateStarDisplay = (rating) => {
            const r = Math.max(1, Math.min(5, Number(rating) || 5));
            starBtns.forEach(btn => {
                const btnRating = Number(btn.dataset.rating) || 1;
                if (btnRating <= r) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            if (ratingDesc) {
                ratingDesc.textContent = ratingDescriptions[r] || `${r}.0 ★`;
            }
        };

        starBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const rating = Number(btn.dataset.rating) || 5;
                updateStarDisplay(rating);
            });

            btn.addEventListener('click', () => {
                currentRating = Number(btn.dataset.rating) || 5;
                if (ratingInput) ratingInput.value = currentRating;
                updateStarDisplay(currentRating);
            });
        });

        if (starPicker) {
            starPicker.addEventListener('mouseleave', () => {
                updateStarDisplay(currentRating);
            });
        }

        // Form submit with inline validation and state feedback
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameEl = document.getElementById('rm-client-name');
                const titleEl = document.getElementById('rm-client-title');
                const companyEl = document.getElementById('rm-client-company');
                const websiteEl = document.getElementById('rm-client-website');
                const textEl = document.getElementById('rm-review-text');
                const statusEl = document.getElementById('rm-status');
                const submitBtn = document.getElementById('submit-review-btn');

                const name = nameEl?.value.trim();
                const title = titleEl?.value.trim();
                const company = companyEl?.value.trim();
                const website = websiteEl?.value.trim() || '';
                const text = textEl?.value.trim();

                // Clear previous invalid states
                [nameEl, titleEl, companyEl, textEl].forEach(el => el?.classList.remove('rm-invalid'));
                if (statusEl) {
                    statusEl.className = 'rm-status';
                    statusEl.textContent = '';
                }

                let cleanWebsite = website;
                if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
                    cleanWebsite = 'https://' + cleanWebsite;
                }

                // Antispam check
                const botCheck = document.getElementById('rm-bot-check')?.value;
                if (botCheck) {
                    console.warn('Bot submission blocked');
                    return;
                }

                // Check required fields
                let hasError = false;
                if (!name) {
                    nameEl?.classList.add('rm-invalid');
                    hasError = true;
                }
                if (!title) {
                    titleEl?.classList.add('rm-invalid');
                    hasError = true;
                }
                if (!company) {
                    companyEl?.classList.add('rm-invalid');
                    hasError = true;
                }
                if (!text) {
                    textEl?.classList.add('rm-invalid');
                    hasError = true;
                }

                if (hasError) {
                    if (statusEl) {
                        statusEl.className = 'rm-status error';
                        statusEl.textContent = 'Please fill out all required fields marked with *';
                    }
                    return;
                }

                if (submitBtn) {
                    submitBtn.innerHTML = '<span class="rm-btn-text">Submitting...</span>';
                    submitBtn.disabled = true;
                }

                try {
                    await window.PortfolioData.submitReview({
                        client_name: name,
                        client_title: title,
                        client_company: company,
                        company_website: cleanWebsite,
                        rating: currentRating,
                        review_text: text,
                        status: 'pending'
                    });

                    if (statusEl) {
                        statusEl.className = 'rm-status success';
                        statusEl.textContent = '✓ Thank you! Your review has been submitted for verification.';
                    }

                    setTimeout(() => {
                        form.reset();
                        currentRating = 5;
                        if (ratingInput) ratingInput.value = 5;
                        updateStarDisplay(5);
                        closeModal();
                        if (statusEl) {
                            statusEl.className = 'rm-status';
                            statusEl.textContent = '';
                        }
                        if (submitBtn) {
                            submitBtn.innerHTML = `
                                <span class="rm-btn-text">Submit Review</span>
                                <svg class="rm-submit-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            `;
                            submitBtn.disabled = false;
                        }
                    }, 1800);
                } catch (err) {
                    console.error('Review submission error:', err);
                    if (statusEl) {
                        statusEl.className = 'rm-status error';
                        statusEl.textContent = 'Submission error. Please check connection and try again.';
                    }
                    if (submitBtn) {
                        submitBtn.innerHTML = `
                            <span class="rm-btn-text">Submit Review</span>
                            <svg class="rm-submit-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        `;
                        submitBtn.disabled = false;
                    }
                }
            });
        }
    };

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

    return {
        init,
        loadApprovedReviews
    };
})();
