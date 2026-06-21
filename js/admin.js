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
    bindNewsForm();
    bindAthleteForm();
    bindSeedButton();
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

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

function bindNewsForm() {
    document.getElementById('form-news').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('news-title').value.trim();
        const details = document.getElementById('news-details').value.trim();
        if (!title || !details) return;

        db.collection('news').add({
            title,
            details,
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
                <div class="meta">
                    <h4>${escapeHtml(n.title || '')}</h4>
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
        const file = document.getElementById('athlete-photo').files[0];

        if (!firstName || !age) return;

        setStatus('athlete-status', 'Saving…', false);

        const saveAthlete = (photoUrl) => {
            db.collection('athletes').add({
                firstName,
                lastName,
                age,
                category,
                achievement,
                photoUrl: photoUrl || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }).then(() => {
                setStatus('athlete-status', 'Shooter added.', false);
                document.getElementById('form-athlete').reset();
            }).catch((err) => {
                setStatus('athlete-status', 'Failed: ' + err.message, true);
            });
        };

        if (file) {
            const path = 'athletes/' + Date.now() + '-' + file.name;
            const ref = firebase.storage().ref().child(path);
            ref.put(file)
                .then((snap) => snap.ref.getDownloadURL())
                .then((url) => saveAthlete(url))
                .catch((err) => setStatus('athlete-status', 'Photo upload failed: ' + err.message, true));
        } else {
            saveAthlete('');
        }
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
                    if (a.photoUrl) {
                        firebase.storage().refFromURL(a.photoUrl).delete().catch(() => { });
                    }
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
// Utility
// ---------------------------------------------------------------------------

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
