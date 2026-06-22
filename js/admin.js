// ---------------------------------------------------------------------------
// Admin gate
// ---------------------------------------------------------------------------

const gateSignedOut = document.getElementById('gate-signed-out');
const gateNotAuthorized = document.getElementById('gate-not-authorized');
const dashboard = document.getElementById('dashboard');

document.getElementById('btn-sign-in').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((err) => {
        alert('Sign-in failed: ' + err.message);
    });
});

['btn-sign-out-1', 'btn-sign-out-2'].forEach((id) => {
    document.getElementById(id).addEventListener('click', () => firebase.auth().signOut());
});

firebase.auth().onAuthStateChanged((user) => {
    gateSignedOut.style.display = 'none';
    gateNotAuthorized.style.display = 'none';
    dashboard.style.display = 'none';

    if (!user) {
        gateSignedOut.style.display = 'block';
        return;
    }

    db.collection('admins').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                document.getElementById('who-email').innerText = user.email || user.uid;
                dashboard.style.display = 'block';
                initDashboard();
            } else {
                gateNotAuthorized.style.display = 'block';
            }
        })
        .catch(() => {
            // Firestore read denied (not in admins collection) lands here too,
            // since the security rule only allows admins to read their own doc.
            gateNotAuthorized.style.display = 'block';
        });
});

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
});

// ---------------------------------------------------------------------------
// Dashboard init — only called once we know the user is an admin
// ---------------------------------------------------------------------------

let dashboardStarted = false;

function initDashboard() {
    if (dashboardStarted) return; // avoid double-binding listeners on re-auth
    dashboardStarted = true;

    watchNews();
    watchAthletes();
    watchMessages();
    watchBlogs();
    bindNewsForm();
    bindAthleteForm();
    bindSeedButton();
    bindBlogForm();
}

function setStatus(elId, message, isError) {
    const el = document.getElementById(elId);
    el.textContent = message;
    el.className = 'admin-status ' + (isError ? 'err' : 'ok');
}

function fmtDate(ts) {
    if (!ts || !ts.toDate) return '';
    return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatNewsDate(dateStr) {
    // Mirrors js/news-components.js — kept separate since admin.html
    // doesn't load Vue and this file is otherwise plain JS.
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const mi = parseInt(m, 10) - 1;
    if (mi < 0 || mi > 11) return dateStr;
    return `${parseInt(d, 10)} ${months[mi]} ${y}`;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

function bindNewsForm() {
    document.getElementById('form-news').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('news-title').value.trim();
        const details = document.getElementById('news-details').value.trim();
        const eventDate = document.getElementById('news-date').value || '';
        const imageUrl = document.getElementById('news-image').value.trim();
        if (!title || !details) return;

        db.collection('news').add({
            title,
            details,
            eventDate,
            imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            setStatus('news-status', 'Published.', false);
            document.getElementById('form-news').reset();
        }).catch((err) => {
            setStatus('news-status', 'Failed: ' + err.message, true);
        });
    });
}

function watchNews() {
    db.collection('news').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const list = document.getElementById('news-list');
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const n = doc.data();
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                ${n.imageUrl ? `<img src="${n.imageUrl}" alt="">` : ''}
                <div class="meta">
                    <h4>${escapeHtml(n.title || '')}${n.eventDate ? ' · ' + escapeHtml(formatNewsDate(n.eventDate)) : ''}</h4>
                    <p>${escapeHtml(n.details || '')}</p>
                </div>
                <div class="actions">
                    <button class="admin-btn danger">Delete</button>
                </div>
            `;
            row.querySelector('.danger').addEventListener('click', () => {
                if (confirm('Delete this news item?')) {
                    db.collection('news').doc(doc.id).delete();
                }
            });
            list.appendChild(row);
        });
    });
}

// ---------------------------------------------------------------------------
// Athletes
// ---------------------------------------------------------------------------

function bindAthleteForm() {
    document.getElementById('form-athlete').addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('athlete-first').value.trim();
        const lastName = document.getElementById('athlete-last').value.trim();
        const age = Number(document.getElementById('athlete-age').value);
        const category = document.getElementById('athlete-category').value;
        const achievement = document.getElementById('athlete-achievement').value.trim();
        const photoUrl = document.getElementById('athlete-photo').value.trim();

        if (!firstName || !age) return;

        setStatus('athlete-status', 'Saving…', false);

        db.collection('athletes').add({
            firstName,
            lastName,
            age,
            category,
            achievement,
            photoUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            setStatus('athlete-status', 'Shooter added.', false);
            document.getElementById('form-athlete').reset();
        }).catch((err) => {
            setStatus('athlete-status', 'Failed: ' + err.message, true);
        });
    });
}

function watchAthletes() {
    db.collection('athletes').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const list = document.getElementById('athlete-list');
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const a = doc.data();
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <img src="${a.photoUrl || 'images/logo/large-logo-dark.svg'}" alt="">
                <div class="meta">
                    <h4>${escapeHtml(a.firstName || '')} ${escapeHtml(a.lastName || '')} · Age ${a.age || '—'}</h4>
                    <p>${escapeHtml(a.category || '')} — ${escapeHtml(a.achievement || '')}</p>
                </div>
                <div class="actions">
                    <button class="admin-btn danger">Delete</button>
                </div>
            `;
            row.querySelector('.danger').addEventListener('click', () => {
                if (confirm('Remove this shooter from the roster?')) {
                    db.collection('athletes').doc(doc.id).delete();
                }
            });
            list.appendChild(row);
        });
    });
}

function bindSeedButton() {
    document.getElementById('btn-seed').addEventListener('click', () => {
        if (!confirm('Add 5 sample shooters to the roster? You can delete them individually afterwards.')) return;

        const samples = [
            { firstName: 'Ananya', lastName: 'Verma', age: 15, category: 'Air Rifle', achievement: 'District Champion, U-17, 2024', photoUrl: 'images/gallery/g1.webp' },
            { firstName: 'Rohan', lastName: 'Mehta', age: 17, category: 'Air Pistol', achievement: 'National Selection Trials Participant, 2024', photoUrl: 'images/gallery/g2.webp' },
            { firstName: 'Aditya', lastName: 'Kumar', age: 16, category: 'Air Rifle', achievement: 'State Level Silver Medalist, 2023', photoUrl: 'images/gallery/g3.jpg' },
            { firstName: 'Priya', lastName: 'Sharma', age: 14, category: 'Air Pistol', achievement: 'Foundation Course Topper, 2024', photoUrl: 'images/gallery/g1.webp' },
            { firstName: 'Karan', lastName: 'Singh', age: 18, category: 'Air Rifle', achievement: 'State Shooting Competition, 4th place, 2023', photoUrl: 'images/gallery/g2.webp' },
        ];

        const batch = db.batch();
        samples.forEach((s) => {
            const ref = db.collection('athletes').doc();
            batch.set(ref, { ...s, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
        batch.commit()
            .then(() => setStatus('athlete-status', 'Sample shooters added.', false))
            .catch((err) => setStatus('athlete-status', 'Failed: ' + err.message, true));
    });
}

// ---------------------------------------------------------------------------
// Messages (read-only + mark read / delete)
// ---------------------------------------------------------------------------

function watchMessages() {
    db.collection('messages').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const list = document.getElementById('message-list');
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const m = doc.data();
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <div class="meta">
                    <h4>${m.read ? '' : '<span class="admin-unread"></span>'}${escapeHtml(m.name || 'Unknown')} · ${fmtDate(m.createdAt)}</h4>
                    <p>${escapeHtml(m.email || '')} ${m.contact ? '· ' + escapeHtml(m.contact) : ''}</p>
                    <p>${escapeHtml(m.message || '')}</p>
                </div>
                <div class="actions">
                    ${m.read ? '' : '<button class="admin-btn ghost mark-read">Mark read</button>'}
                    <button class="admin-btn danger">Delete</button>
                </div>
            `;
            const markBtn = row.querySelector('.mark-read');
            if (markBtn) {
                markBtn.addEventListener('click', () => db.collection('messages').doc(doc.id).update({ read: true }));
            }
            row.querySelector('.danger').addEventListener('click', () => {
                if (confirm('Delete this message?')) {
                    db.collection('messages').doc(doc.id).delete();
                }
            });
            list.appendChild(row);
        });
    });
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

function bindBlogForm() {
    const markdownEl = document.getElementById('blog-markdown');
    const previewEl = document.getElementById('blog-preview');

    markdownEl.addEventListener('input', () => {
        previewEl.innerHTML = marked.parse(markdownEl.value || '');
    });

    document.getElementById('btn-blog-cancel-edit').addEventListener('click', () => {
        resetBlogForm();
    });

    document.getElementById('form-blog').addEventListener('submit', (e) => {
        e.preventDefault();

        const editId = document.getElementById('blog-edit-id').value;
        const title = document.getElementById('blog-title').value.trim();
        const coverImageUrl = document.getElementById('blog-cover').value.trim();
        const excerpt = document.getElementById('blog-excerpt').value.trim();
        const markdown = markdownEl.value;

        if (!title || !markdown) return;

        const payload = { title, coverImageUrl, excerpt, markdown };

        if (editId) {
            payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            db.collection('blogs').doc(editId).update(payload)
                .then(() => {
                    setStatus('blog-status', 'Post updated.', false);
                    resetBlogForm();
                })
                .catch((err) => setStatus('blog-status', 'Failed: ' + err.message, true));
        } else {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            db.collection('blogs').add(payload)
                .then(() => {
                    setStatus('blog-status', 'Published.', false);
                    resetBlogForm();
                })
                .catch((err) => setStatus('blog-status', 'Failed: ' + err.message, true));
        }
    });
}

function resetBlogForm() {
    document.getElementById('form-blog').reset();
    document.getElementById('blog-edit-id').value = '';
    document.getElementById('blog-preview').innerHTML = '';
    document.getElementById('blog-form-heading').innerText = 'Write a post';
    document.getElementById('blog-submit-btn').innerText = 'Publish';
    document.getElementById('btn-blog-cancel-edit').style.display = 'none';
}

function watchBlogs() {
    db.collection('blogs').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const list = document.getElementById('blog-list');
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const b = doc.data();
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                ${b.coverImageUrl ? `<img src="${b.coverImageUrl}" alt="">` : ''}
                <div class="meta">
                    <h4>${escapeHtml(b.title || 'Untitled')}</h4>
                    <p>${escapeHtml(b.excerpt || stripMarkdownExcerpt(b.markdown, 100))}</p>
                </div>
                <div class="actions">
                    <button class="admin-btn ghost edit-btn">Edit</button>
                    <button class="admin-btn danger">Delete</button>
                </div>
            `;
            row.querySelector('.edit-btn').addEventListener('click', () => {
                document.getElementById('blog-edit-id').value = doc.id;
                document.getElementById('blog-title').value = b.title || '';
                document.getElementById('blog-cover').value = b.coverImageUrl || '';
                document.getElementById('blog-excerpt').value = b.excerpt || '';
                document.getElementById('blog-markdown').value = b.markdown || '';
                document.getElementById('blog-preview').innerHTML = marked.parse(b.markdown || '');
                document.getElementById('blog-form-heading').innerText = 'Editing: ' + (b.title || 'Untitled');
                document.getElementById('blog-submit-btn').innerText = 'Save changes';
                document.getElementById('btn-blog-cancel-edit').style.display = 'inline-block';
                document.querySelector('.admin-tab[data-tab="blog"]').click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            row.querySelector('.danger').addEventListener('click', () => {
                if (confirm('Delete this post?')) {
                    db.collection('blogs').doc(doc.id).delete();
                }
            });
            list.appendChild(row);
        });
    });
}



function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
