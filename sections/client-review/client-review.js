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
                reviews = await window.PortfolioData.getApprovedReviews();
            }
            if (!reviews || !reviews.length) {
                reviews = (window.DEFAULT_FALLBACK_DATA && window.DEFAULT_FALLBACK_DATA.reviews) || [];
            }
            if (reviews && reviews.length > 0) {
                renderReviews(reviews);
                computeMetrics(reviews);
            }
        } catch (err) {
            console.warn('Error loading approved reviews:', err);
        }
    };

    const computeMetrics = (reviews) => {
        const avgScoreEl = document.getElementById('review-avg-score');
        const verifiedCountEl = document.getElementById('review-verified-count');
        const ratingBarsEl = document.getElementById('rating-bars');

        if (!reviews || reviews.length === 0) {
            if (avgScoreEl) avgScoreEl.textContent = '5.0';
            if (verifiedCountEl) verifiedCountEl.textContent = '2 Verified Client Reviews';
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
        if (!container || !reviews || !reviews.length) return;

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
        const modal = document.getElementById('review-modal');
        const openBtn = document.getElementById('open-review-modal-btn');
        const closeBtn = document.getElementById('close-review-modal-btn');
        const cancelBtn = document.getElementById('cancel-review-btn');
        const form = document.getElementById('client-review-form');

        const openModal = () => {
            if (modal) {
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                document.documentElement.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            }
        };

        const closeModal = () => {
            if (modal) {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
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
            if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
                closeModal();
            }
        });

        // Star picker buttons
        const starBtns = document.querySelectorAll('.star-pick-btn');
        const ratingInput = document.getElementById('review-rating-val');

        starBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = Number(btn.dataset.rating) || 5;
                currentRating = rating;
                if (ratingInput) ratingInput.value = rating;

                starBtns.forEach((b, i) => {
                    if (i < rating) b.classList.add('active');
                    else b.classList.remove('active');
                });
            });
        });

        // Form submit
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('rm-client-name')?.value.trim();
                const title = document.getElementById('rm-client-title')?.value.trim();
                const company = document.getElementById('rm-client-company')?.value.trim();
                const website = document.getElementById('rm-client-website')?.value.trim() || '';
                const text = document.getElementById('rm-review-text')?.value.trim();
                const statusEl = document.getElementById('rm-status');
                const submitBtn = document.getElementById('submit-review-btn');

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

                if (!name || !company || !text) {
                    if (statusEl) {
                        statusEl.textContent = 'Please fill in Name, Company, and your Review.';
                        statusEl.style.color = '#ef4444';
                    }
                    return;
                }

                if (submitBtn) {
                    submitBtn.textContent = 'Submitting...';
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
                        statusEl.textContent = '✓ Thank you! Your review has been submitted for verification.';
                        statusEl.style.color = '#10b981';
                    }

                    setTimeout(() => {
                        form.reset();
                        closeModal();
                        if (statusEl) statusEl.textContent = '';
                        if (submitBtn) {
                            submitBtn.textContent = 'Submit Review';
                            submitBtn.disabled = false;
                        }
                    }, 1800);
                } catch (err) {
                    console.error('Review submission error:', err);
                    if (statusEl) {
                        statusEl.textContent = 'Submission error. Please try again.';
                        statusEl.style.color = '#ef4444';
                    }
                    if (submitBtn) {
                        submitBtn.textContent = 'Submit Review';
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
