/**
 * ════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT & DATA PROVIDER FOR PORTFOLIO & DASHBOARD
 * ════════════════════════════════════════════════════════════════
 * Manages all cloud database interactions (Messages, Reviews,
 * Experiences, and Projects) with instant local fallback.
 */

const SUPABASE_CONFIG = {
    // Live Supabase Project credentials:
    url: window.SUPABASE_URL || localStorage.getItem('portfolio_supabase_url') || 'https://vppkucipdfbshqxjwlcx.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || localStorage.getItem('portfolio_supabase_anon_key') || 'sb_publishable_D3V48ToGaEfKcz1j5TuosA_9ilWhesr',
    
    // EmailJS credentials for dual inbox delivery (optional but supported):
    emailJsServiceId: window.EMAILJS_SERVICE_ID || localStorage.getItem('portfolio_emailjs_service_id') || '',
    emailJsTemplateId: window.EMAILJS_TEMPLATE_ID || localStorage.getItem('portfolio_emailjs_template_id') || '',
    emailJsPublicKey: window.EMAILJS_PUBLIC_KEY || localStorage.getItem('portfolio_emailjs_public_key') || '',
};

// Initial Seed Fallback Data (ensures site is functional even before Supabase credentials are input)
const DEFAULT_FALLBACK_DATA = {
    projects: [
        {
            id: 'travoqix',
            slug: 'travoqix',
            title: 'Travoqix',
            category: 'Travel & Tourism',
            description: 'Delhi-based travel platform built for premium group, corporate, and custom journeys with polished booking flows and cinematic brand presentation.',
            tech_stack: ['Go', 'Kafka', 'Redis', 'Kubernetes', 'Prometheus', 'TimescaleDB'],
            live_url: 'https://travoqix.in/',
            github_url: '',
            video_url: 'assets/videos/Travoqix.mp4',
            preview_type: 'video',
            card_color: '#3d8bff',
            order_index: 1,
            is_active: true
        },
        {
            id: 'fr-bot',
            slug: 'fr-bot',
            title: 'FR Bot',
            category: 'AI & Automation',
            description: 'Rule-based assistant designed for fast intent resolution with keyword routing, structured fallback responses, and repeatable interaction flows.',
            tech_stack: ['Python', 'NLP', 'Regex', 'FastAPI'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#10b981',
            order_index: 2,
            is_active: true
        },
        {
            id: 'boxoffice-oracle',
            slug: 'boxoffice-oracle',
            title: 'BoxOffice Oracle',
            category: 'Data Science',
            description: 'Predictive analytics system modeling movie performance through cast, production, and distribution features with decision-focused dashboards.',
            tech_stack: ['Python', 'Pandas', 'scikit-learn'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#8b5cf6',
            order_index: 3,
            is_active: true
        },
        {
            id: 'akrti-dashboard',
            slug: 'akrti-dashboard',
            title: 'AKRTI BI Dashboard',
            category: 'Analytics',
            description: 'KPI intelligence dashboard built for fast operational visibility, layered exploration, and business storytelling through responsive data views.',
            tech_stack: ['Power BI', 'Visualization', 'DAX'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#f59e0b',
            order_index: 4,
            is_active: true
        },
        {
            id: 'caseflow',
            slug: 'caseflow',
            title: 'CaseFlow Legal Manager',
            category: 'Legal Tech',
            description: 'Structured legal operations workflow with summary generation, appointment orchestration, and automated communication loops for client-lawyer coordination.',
            tech_stack: ['Python', 'Flask', 'Automation'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#06b6d4',
            order_index: 5,
            is_active: true
        },
        {
            id: 'password-hunter',
            slug: 'password-hunter',
            title: 'Password Hunter',
            category: 'Cyber Security',
            description: 'Cyberpunk brute-force simulator with terminal storytelling, password analysis, installable app support, and real-time security theatre.',
            tech_stack: ['Next.js', 'Rust', 'CloudFront', 'DynamoDB', 'Lambda@Edge'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#ef4444',
            order_index: 6,
            is_active: true
        }
    ],
    experiences: [
        {
            id: 'exp-1',
            role: 'Data Analyst Intern',
            company: 'CodSoft',
            location: 'Remote',
            duration: 'August 2025 — September 2025',
            description: 'Designed modular data analysis and visualization pipelines with Python (Pandas, NumPy, Matplotlib) and Excel, streamlining structured exploratory data analysis (EDA) and automated summary generation.',
            order_index: 1
        },
        {
            id: 'exp-2',
            role: 'Data Analyst Intern',
            company: 'Sunbuzz Media',
            location: 'Delhi, India',
            duration: 'January 2026 — February 2026',
            description: 'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
            order_index: 2
        },
        {
            id: 'exp-3',
            role: 'Freelance Web Developer',
            company: 'Travoqix',
            location: 'Remote',
            duration: 'March 2026',
            description: 'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
            order_index: 3
        },
        {
            id: 'exp-4',
            role: 'Freelance Software Developer',
            company: 'Krisha Events',
            location: 'Remote',
            duration: 'September 2026 — Present',
            description: 'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
            order_index: 4
        },
        {
            id: 'exp-5',
            role: 'AI/ML & API Developer Intern',
            company: 'Delhi e-Governance Society (DeGS)',
            location: 'Delhi, India',
            duration: 'August 2026 — Present',
            description: 'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
            order_index: 5
        }
    ],
    reviews: [
        {
            id: 'rev-1',
            client_name: 'Mr. Satyajit Nanda',
            client_title: 'CEO',
            client_company: 'Travoqix',
            rating: 5,
            review_text: 'I am really impressed with the work done on Travoqix. The website turned out far better and more beautiful than we expected. The attention to detail, animations, and overall design quality were excellent. The project was completed in just 2 weeks, while the expected timeline was 30 days. Everything was handled professionally and smoothly. Highly recommended for quality web development work.',
            status: 'approved',
            is_featured: true,
            created_at: '2026-03-15T10:00:00Z'
        },
        {
            id: 'rev-2',
            client_name: 'Mr. Aniket Gupta',
            client_title: 'COO',
            client_company: 'Sunbuzz Media',
            rating: 5,
            review_text: 'Outstanding analytical and problem-solving capability. Delivered clean dashboards and automated repetitive data pipeline tasks with precision.',
            status: 'approved',
            is_featured: true,
            created_at: '2025-02-28T14:30:00Z'
        }
    ],
    messages: []
};

// Initialize Supabase Client if credentials exist
let supabaseClient = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const url = SUPABASE_CONFIG.url;
    const key = SUPABASE_CONFIG.anonKey;
    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
        } catch (e) {
            console.warn('[Supabase] Initialization failed, falling back to local store:', e);
        }
    }
    return supabaseClient;
}

// Local Storage Helper
function getLocalCollection(key, defaultData) {
    try {
        const stored = localStorage.getItem(`portfolio_${key}`);
        if (!stored) {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(defaultData));
            return defaultData;
        }
        const parsed = JSON.parse(stored);
        if ((key === 'projects' || key === 'experiences') && Array.isArray(parsed) && parsed.length < defaultData.length) {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(defaultData));
            return defaultData;
        }
        if (key === 'experiences' && Array.isArray(parsed) && !parsed.some(e => e.company && e.company.includes('DeGS'))) {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(defaultData));
            return defaultData;
        }
        return parsed;
    } catch {
        return defaultData;
    }
}

function setLocalCollection(key, data) {
    try {
        localStorage.setItem(`portfolio_${key}`, JSON.stringify(data));
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
}

// ─────────────────────────────────────────────────────────────
// DATA ACCESS API (Used by Portfolio and Dashboard)
// ─────────────────────────────────────────────────────────────

const PortfolioData = {
    // 1. Projects
    async getProjects() {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('projects')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Using local fallback for projects:', err);
            }
        }
        return getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
    },

    async saveProject(project) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('projects').upsert(project).select();
                if (!error && data && data.length > 0) {
                    const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
                    const idx = projects.findIndex(p => p.id === project.id);
                    if (idx >= 0) projects[idx] = { ...projects[idx], ...project, ...data[0] };
                    else projects.push({ id: project.id || data[0].id, ...project, ...data[0] });
                    setLocalCollection('projects', projects);
                    try { window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: project })); } catch (_) {}
                    return data[0];
                }
                if (error) {
                    console.warn('Upsert with full payload failed, trying without extra columns:', error);
                    const { card_color, ...safeProject } = project;
                    await client.from('projects').upsert(safeProject);
                }
            } catch (e) {
                console.warn('Cloud save project failed, saving locally:', e);
            }
        }
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx >= 0) projects[idx] = { ...projects[idx], ...project };
        else projects.push({ id: project.id || 'proj-' + Date.now(), ...project });
        setLocalCollection('projects', projects);
        try { window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: project })); } catch (_) {}
        return project;
    },

    async deleteProject(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('projects').delete().eq('id', id);
            } catch (e) {
                console.warn('Cloud delete project failed:', e);
            }
        }
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects).filter(p => p.id !== id);
        setLocalCollection('projects', projects);
    },

    // 2. Experiences
    async getExperiences() {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('experiences')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Using local fallback for experiences:', err);
            }
        }
        return getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
    },

    async saveExperience(exp) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client.from('experiences').upsert(exp).select();
                if (error) throw error;
                return data[0];
            } catch (e) {
                console.warn('Cloud save experience failed, saving locally:', e);
            }
        }
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        const idx = exps.findIndex(e => e.id === exp.id);
        if (idx >= 0) exps[idx] = { ...exps[idx], ...exp };
        else exps.push({ id: exp.id || 'exp-' + Date.now(), ...exp });
        setLocalCollection('experiences', exps);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: exp }));
        } catch (_) {}
        return exp;
    },

    async deleteExperience(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('experiences').delete().eq('id', id);
            } catch (e) {
                console.warn('Cloud delete experience failed:', e);
            }
        }
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences).filter(e => e.id !== id);
        setLocalCollection('experiences', exps);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: { id, deleted: true } }));
        } catch (_) {}
    },

    // 3. Reviews (Public & Admin)
    async getApprovedReviews() {
        let cloudReviews = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                if (!error && Array.isArray(data)) {
                    cloudReviews = data;
                }
            } catch (err) {
                console.warn('Supabase getApprovedReviews error:', err);
            }
        }

        const localAll = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        const localApproved = localAll.filter(r => r.status === 'approved');

        if (cloudReviews.length > 0) {
            // Merge cloud reviews with any local approved reviews not yet in cloud
            const cloudIds = new Set(cloudReviews.map(r => r.id));
            const cloudNames = new Set(cloudReviews.map(r => (r.client_name || '').toLowerCase()));
            const uniqueLocal = localApproved.filter(r => !cloudIds.has(r.id) && !cloudNames.has((r.client_name || '').toLowerCase()));
            return [...uniqueLocal, ...cloudReviews];
        }

        return localApproved;
    },

    async getAllReviews() {
        let cloudReviews = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && Array.isArray(data) && data.length > 0) {
                    cloudReviews = data;
                }
            } catch (err) {
                console.warn('Supabase getAllReviews error:', err);
            }
        }
        const localAll = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        if (cloudReviews.length > 0) {
            const cloudIds = new Set(cloudReviews.map(r => r.id));
            const cloudNames = new Set(cloudReviews.map(r => (r.client_name || '').trim().toLowerCase()));
            const uniqueLocal = localAll.filter(r => !cloudIds.has(r.id) && !cloudNames.has((r.client_name || '').trim().toLowerCase()));
            return [...uniqueLocal, ...cloudReviews];
        }
        return localAll;
    },

    async submitReview(review) {
        // Enforce pending moderation status for public submissions
        const reviewStatus = (review && review.status === 'approved' && review.isAdmin) ? 'approved' : 'pending';
        const newReview = {
            id: review.id || 'rev-' + Date.now(),
            client_name: review.client_name,
            client_title: review.client_title || '',
            client_company: review.client_company || '',
            rating: Number(review.rating) || 5,
            review_text: review.review_text,
            avatar_url: review.avatar_url || '',
            status: reviewStatus,
            is_featured: false,
            created_at: new Date().toISOString()
        };

        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    client_name: review.client_name,
                    client_title: review.client_title || '',
                    client_company: review.client_company || '',
                    rating: Number(review.rating) || 5,
                    review_text: review.review_text,
                    avatar_url: review.avatar_url || '',
                    status: reviewStatus,
                    is_featured: false
                };
                const { data, error } = await client.from('client_reviews').insert([dbPayload]).select();
                if (!error && data && data[0] && data[0].id) {
                    newReview.id = data[0].id;
                } else if (error) {
                    console.warn('Supabase review insert notice (falling back locally):', error.message || error);
                }
            } catch (e) {
                console.warn('Cloud review submission failed, saving locally:', e);
            }
        }

        // Always update local cache so review appears on screen instantly
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        reviews.unshift(newReview);
        setLocalCollection('reviews', reviews);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: newReview }));
        } catch (_) {}

        return { success: true, review: newReview };
    },

    async updateReviewStatus(id, status) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client.from('client_reviews').update({ status }).eq('id', id);
                if (error) console.warn('Supabase update review error:', error);
            } catch (e) {
                console.warn('Cloud review update failed:', e);
            }
        }
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        const target = reviews.find(r => r.id === id);
        if (target) {
            target.status = status;
            setLocalCollection('reviews', reviews);
        }
        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, status } }));
        } catch (_) {}
    },

    async deleteReview(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client.from('client_reviews').delete().eq('id', id);
                if (error) console.warn('Supabase delete review error:', error);
            } catch (e) {
                console.warn('Cloud review delete failed:', e);
            }
        }
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews).filter(r => r.id !== id);
        setLocalCollection('reviews', reviews);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, deleted: true } }));
        } catch (_) {}
    },

    // 4. Contact Messages & Dual Email Delivery
    async submitContactMessage(msg) {
        let dbSuccess = false;
        const record = {
            id: 'msg-' + Date.now(),
            name: msg.name,
            company: msg.company || '',
            email: msg.email,
            message: msg.message,
            website: msg.website || '',
            is_read: false,
            source: msg.source || 'contact_form',
            created_at: new Date().toISOString()
        };

        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    name: msg.name,
                    company: msg.company || '',
                    email: msg.email,
                    message: msg.message,
                    website: msg.website || '',
                    is_read: false,
                    source: msg.source || 'contact_form'
                };
                const { error } = await client.from('contact_messages').insert([dbPayload]);
                if (!error) dbSuccess = true;
                else console.warn('Supabase message insert error:', error);
            } catch (e) {
                console.warn('Cloud message insert failed, using local store:', e);
            }
        }

        if (!dbSuccess) {
            const messages = getLocalCollection('messages', []);
            messages.unshift(record);
            setLocalCollection('messages', messages);
        }

        // Dual Delivery: Dispatch to Personal Email
        // 1. If EmailJS is loaded/configured:
        if (window.emailjs && SUPABASE_CONFIG.emailJsServiceId && SUPABASE_CONFIG.emailJsTemplateId) {
            try {
                await window.emailjs.send(
                    SUPABASE_CONFIG.emailJsServiceId,
                    SUPABASE_CONFIG.emailJsTemplateId,
                    {
                        from_name: msg.name,
                        from_company: msg.company || 'N/A',
                        from_email: msg.email,
                        message: msg.message,
                        website: msg.website || 'N/A',
                        to_email: 'akshaychauhan003@gmail.com'
                    }
                );
            } catch (err) {
                console.warn('EmailJS delivery error:', err);
            }
        }

        // 2. Also forward to existing verified Apps Script fallback endpoint
        const APPS_SCRIPT_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzUp_KYLeOAclVztnPdwwYBoLNF00EIlh9sR82GNiYezu0M4svG_fFOHeafiQMZ1s4d/exec';
        try {
            fetch(APPS_SCRIPT_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: msg.name,
                    company: msg.company,
                    email: msg.email,
                    message: msg.message,
                    website: msg.website,
                    date: record.created_at
                })
            }).catch(() => {});
        } catch {}

        return { success: true, record };
    },

    async getMessages() {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('contact_messages')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && data) return data;
            } catch (err) {
                console.warn('Using local fallback for messages:', err);
            }
        }
        return getLocalCollection('messages', []);
    },

    async markMessageRead(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('contact_messages').update({ is_read: true }).eq('id', id);
            } catch (e) {
                console.warn('Cloud message update failed:', e);
            }
        }
        const msgs = getLocalCollection('messages', []);
        const target = msgs.find(m => m.id === id);
        if (target) {
            target.is_read = true;
            setLocalCollection('messages', msgs);
        }
    },

    async deleteMessage(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('contact_messages').delete().eq('id', id);
            } catch (e) {
                console.warn('Cloud message delete failed:', e);
            }
        }
        const msgs = getLocalCollection('messages', []).filter(m => m.id !== id);
        setLocalCollection('messages', msgs);
    },

    // 5. Admin Authentication & Access Controls
    async loginAdmin(email, password) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase client not initialized');
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.setItem('portfolio_console_unlocked', 'true');
        return data;
    },

    async logoutAdmin() {
        const client = getSupabaseClient();
        if (client) {
            try { await client.auth.signOut(); } catch (_) {}
        }
        localStorage.removeItem('portfolio_console_unlocked');
    },

    async getAdminSession() {
        const client = getSupabaseClient();
        if (!client) return null;
        try {
            const { data } = await client.auth.getSession();
            return data?.session || null;
        } catch (_) {
            return null;
        }
    },

    verifyAdminPin(enteredPin) {
        const currentPin = localStorage.getItem('portfolio_admin_pin') || '2026';
        const isMatch = String(enteredPin).trim() === String(currentPin).trim();
        if (isMatch) {
            localStorage.setItem('portfolio_console_unlocked', 'true');
        }
        return isMatch;
    },

    setAdminPin(newPin) {
        if (!newPin || newPin.length < 4) throw new Error('PIN must be at least 4 digits');
        localStorage.setItem('portfolio_admin_pin', String(newPin).trim());
        return true;
    },

    isConsoleUnlocked() {
        return localStorage.getItem('portfolio_console_unlocked') === 'true';
    }
};

window.PortfolioData = PortfolioData;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
