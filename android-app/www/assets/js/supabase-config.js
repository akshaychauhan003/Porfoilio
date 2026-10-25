/**
 * ════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT & DATA PROVIDER FOR PORTFOLIO & DASHBOARD
 * ════════════════════════════════════════════════════════════════
 * Manages all cloud database interactions (Messages, Reviews,
 * Experiences, and Projects) with instant local fallback.
 */

const SUPABASE_CONFIG = {
    // Replace with your Supabase Project settings (Settings > API):
    url: window.SUPABASE_URL || localStorage.getItem('portfolio_supabase_url') || '',
    anonKey: window.SUPABASE_ANON_KEY || localStorage.getItem('portfolio_supabase_anon_key') || '',
    
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
            order_index: 6,
            is_active: true
        }
    ],
    experiences: [
        {
            id: 'exp-1',
            role: 'Freelance Developer',
            company: 'Travoqix',
            location: 'Remote',
            duration: 'March 2026',
            description: 'Engineered a scalable frontend foundation with cinematic UI, automated booking flows, and production-safe delivery for a live travel product.',
            order_index: 1
        },
        {
            id: 'exp-2',
            role: 'Data Analyst Intern',
            company: 'Sunbuzz Media',
            location: 'Delhi',
            duration: 'January 2025 — February 2025',
            description: 'Built Python and SQL analysis workflows, delivered dashboard reporting, and surfaced actionable patterns from multi-source business data.',
            order_index: 2
        },
        {
            id: 'exp-3',
            role: 'Data Analyst Intern',
            company: 'CodeSoft',
            location: 'Remote',
            duration: 'August 2025 — September 2025',
            description: 'Delivered reusable analysis pipelines spanning cleaning, EDA, visualization, and reporting while reducing repetitive reporting effort across structured datasets.',
            order_index: 3
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
            supabaseClient = window.supabase.createClient(url, key);
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
        if (key === 'projects' && Array.isArray(parsed) && parsed.length < defaultData.length) {
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
                if (error) throw error;
                return data[0];
            } catch (e) {
                console.warn('Cloud save project failed, saving locally:', e);
            }
        }
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx >= 0) projects[idx] = { ...projects[idx], ...project };
        else projects.push({ id: project.id || 'proj-' + Date.now(), ...project });
        setLocalCollection('projects', projects);
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
    },

    // 3. Reviews (Public & Admin)
    async getApprovedReviews() {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Using local fallback for approved reviews:', err);
            }
        }
        const all = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        return all.filter(r => r.status === 'approved');
    },

    async getAllReviews() {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && data) return data;
            } catch (err) {
                console.warn('Using local fallback for all reviews:', err);
            }
        }
        return getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
    },

    async submitReview(review) {
        const newReview = {
            id: review.id || 'rev-' + Date.now(),
            client_name: review.client_name,
            client_title: review.client_title || '',
            client_company: review.client_company || '',
            rating: Number(review.rating) || 5,
            review_text: review.review_text,
            avatar_url: review.avatar_url || '',
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .insert([newReview])
                    .select();
                if (error) throw error;
                return { success: true, review: data ? data[0] : newReview };
            } catch (e) {
                console.warn('Cloud review submission failed, saving locally:', e);
            }
        }

        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        reviews.unshift(newReview);
        setLocalCollection('reviews', reviews);
        return { success: true, review: newReview };
    },

    async updateReviewStatus(id, status) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('client_reviews').update({ status }).eq('id', id);
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
    },

    async deleteReview(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await client.from('client_reviews').delete().eq('id', id);
            } catch (e) {
                console.warn('Cloud review delete failed:', e);
            }
        }
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews).filter(r => r.id !== id);
        setLocalCollection('reviews', reviews);
    },

    // 4. Contact Messages & Dual Email Delivery
    async submitContactMessage(msg) {
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

        let dbSuccess = false;
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client.from('contact_messages').insert([record]);
                if (!error) dbSuccess = true;
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

        // 2. Also forward to existing Apps Script fallback endpoint if available
        const endpoint = msg.endpoint || 'https://script.google.com/macros/s/AKfycbzUp_KYLeOAclVztnPdwwYBoLNF00EIlh9sR82GNiYezu0M4svG_fFOHeafiQMZ1s4d/exec';
        if (endpoint) {
            try {
                fetch(endpoint, {
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
        }

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
    }
};

window.PortfolioData = PortfolioData;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
