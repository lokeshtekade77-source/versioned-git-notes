import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DOM ELEMENT SELECTORS ---
const preloader = document.getElementById('preloader');
const mainHeader = document.getElementById('main-header');
const heroCanvas = document.getElementById('hero-canvas');
const notesGrid = document.getElementById('notes-grid');
const modal = document.getElementById('note-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

// --- DATA SOURCE ---
const notesManifest = [
    { 
      id: 'note1', 
      file: 'notes/note1.md', 
      title: 'Introduction to Git & GitHub', 
      summary: 'Learn the core concepts of version control with Git and how to host your repositories on GitHub.', 
      tags: ["Git Basics", "GitHub", "Workflow"] 
    },
    { 
      id: 'note2', 
      file: 'notes/note2.md', 
      title: 'Branching & Collaboration', 
      summary: 'Understand how to use branches to work on features in parallel and collaborate effectively with a team.', 
      tags: ["Branching", "Merge", "Collaboration"] 
    },
    { 
      id: 'note3', 
      file: 'notes/note3.md', 
      title: 'Tags & Versioning', 
      summary: 'Discover how to tag specific points in history, perfect for marking release versions like v1.0.', 
      tags: ["Versioning", "Tags", "Release"] 
    }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollEffects();
    initThreeJS();
    populateNotes();
    initGitSimulator();
});

// --- PRELOADER ---
function initPreloader() {
    const loaderTextEl = preloader.querySelector('.loader-text');
    const text = "INITIALIZING_REPOSITORY...";
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            loaderTextEl.textContent += text[i];
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.transition = 'opacity 0.5s ease';
                preloader.style.opacity = '0';
                preloader.addEventListener('transitionend', () => preloader.style.display = 'none');
            }, 500);
        }
    }, 80);
}

// --- UI & SCROLL EFFECTS ---
function initScrollEffects() {
    // Header shrink on scroll
    window.addEventListener('scroll', () => {
        mainHeader.classList.toggle('py-2', window.scrollY > 50);
        mainHeader.classList.toggle('py-4', window.scrollY <= 50);
    });

    // Fade-in elements on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
}


// --- 3D HERO BACKGROUND ---
function initThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 5000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 'cyan',
        blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    camera.position.z = 5;
    
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        particleSystem.rotation.y = elapsedTime * 0.1 + mouse.x * 0.2;
        particleSystem.rotation.x = elapsedTime * 0.05 + mouse.y * 0.2;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

// --- NOTES & MODAL LOGIC ---
function populateNotes() {
    notesManifest.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'glass-effect p-6 rounded-2xl scroll-fade card-glow-border cursor-pointer flex flex-col';
        card.style.transitionDelay = `${index * 100}ms`;
        
        const tagsHtml = note.tags.map(tag => `<span class="bg-gray-700 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">${tag}</span>`).join('');

        card.innerHTML = `
            <h3 class="text-2xl font-bold mb-3 text-[var(--primary-accent)]">${note.title}</h3>
            <p class="text-gray-300 flex-grow mb-4">${note.summary}</p>
            <div class="flex flex-wrap">${tagsHtml}</div>
        `;
        card.addEventListener('click', () => openModal(note));
        notesGrid.appendChild(card);
    });
    // Re-observe for scroll fade effect on new cards
    document.querySelectorAll('.scroll-fade').forEach(el => new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'));
    }, { threshold: 0.1 }).observe(el));
}

async function openModal(note) {
    modalTitle.textContent = note.title;
    modalContent.innerHTML = '<p>Loading note...</p>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const response = await fetch(note.file);
        if (!response.ok) throw new Error('Network response was not ok');
        const markdown = await response.text();
        modalContent.innerHTML = marked.parse(markdown);
        addCopyButtonsToCodeBlocks();
    } catch (error) {
        modalContent.innerHTML = `<p class="text-red-400">Error: Could not load the note. Please try again later.</p>`;
        console.error('Failed to fetch note:', error);
    }
}

function addCopyButtonsToCodeBlocks() {
    modalContent.querySelectorAll('pre').forEach(pre => {
        const code = pre.querySelector('code');
        if (!code) return;

        const btn = document.createElement('button');
        btn.textContent = 'Copy';
        btn.className = 'copy-code-btn';
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(code.innerText);
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy' }, 2000);
        });
        pre.appendChild(btn);
    });
}

// Close Modal Logic
modalCloseBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
});


// --- GIT SIMULATOR LOGIC ---
function initGitSimulator() {
    let repo = {
        branches: { main: [] },
        currentBranch: 'main',
        tags: {},
    };

    const appendToTerminal = (text, type = 'log') => {
        const p = document.createElement('p');
        if (type === 'command') {
            p.innerHTML = `<span class="text-green-400 font-bold">></span> ${text}`;
        } else if (type === 'error') {
            p.className = 'text-red-400';
            p.textContent = `Error: ${text}`;
        } else {
            p.textContent = text;
        }
        terminalOutput.appendChild(p);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const handleCommand = (cmd) => {
        const [command, ...args] = cmd.split(' ');
        if (command !== 'git') {
            appendToTerminal(`'${command}' is not recognized. Try 'git'.`, 'error');
            return;
        }

        const subCommand = args[0];
        switch (subCommand) {
            case 'commit':
                const msgMatch = cmd.match(/-m\s+"([^"]+)"/);
                if (msgMatch && msgMatch[1]) {
                    const commit = { msg: msgMatch[1], id: Math.random().toString(36).substring(2, 9) };
                    repo.branches[repo.currentBranch].push(commit);
                    appendToTerminal(`[${repo.currentBranch} ${commit.id}] ${commit.msg}`);
                } else {
                    appendToTerminal('Commit message needed. Use: git commit -m "Your message"', 'error');
                }
                break;
            case 'branch':
                const branchName = args[1];
                if (branchName) {
                    if (!repo.branches[branchName]) {
                        repo.branches[branchName] = [...repo.branches[repo.currentBranch]];
                        appendToTerminal(`Branch '${branchName}' created.`);
                    } else {
                        appendToTerminal(`Branch '${branchName}' already exists.`, 'error');
                    }
                } else {
                    Object.keys(repo.branches).forEach(b => {
                        appendToTerminal(`${b === repo.currentBranch ? '*' : ' '} ${b}`);
                    });
                }
                break;
            case 'checkout':
                const targetBranch = args[1];
                if (repo.branches[targetBranch]) {
                    repo.currentBranch = targetBranch;
                    appendToTerminal(`Switched to branch '${targetBranch}'.`);
                } else {
                    appendToTerminal(`Branch '${targetBranch}' does not exist.`, 'error');
                }
                break;
            case 'merge':
                const branchToMerge = args[1];
                if (repo.branches[branchToMerge]) {
                    if (branchToMerge === repo.currentBranch) {
                        appendToTerminal(`Cannot merge a branch into itself.`, 'error');
                        return;
                    }
                    // A simplified merge for simulation
                    repo.branches[repo.currentBranch].push(...repo.branches[branchToMerge]);
                    appendToTerminal(`Merged branch '${branchToMerge}' into '${repo.currentBranch}'.`);
                } else {
                    appendToTerminal(`Branch '${branchToMerge}' does not exist.`, 'error');
                }
                break;
            case 'tag':
                const tagName = args[1];
                if (tagName) {
                    repo.tags[tagName] = repo.branches[repo.currentBranch].slice(-1)[0]?.id || 'initial';
                    appendToTerminal(`Tag '${tagName}' created successfully.`);
                } else {
                    appendToTerminal('Tags: ' + Object.keys(repo.tags).join(', '));
                }
                break;
            case 'log':
                appendToTerminal(`--- Commit history for [${repo.currentBranch}] ---`);
                [...repo.branches[repo.currentBranch]].reverse().forEach(c => {
                    appendToTerminal(`commit ${c.id}\n  ${c.msg}\n`);
                });
                break;
            default:
                appendToTerminal(`'git ${subCommand}' is not a valid command here.`, 'error');
        }
    };

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = e.target.value.trim();
            if (command) {
                appendToTerminal(command, 'command');
                handleCommand(command);
                e.target.value = '';
            }
        }
    });
}