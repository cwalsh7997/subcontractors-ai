/**
 * Toast Notification System - Subcontractors.ai
 * Lightweight, reusable toast notifications for the app.
 * 
 * Usage:
 *   toast.success('Profile saved!');
 *   toast.error('Something went wrong');
 *   toast.warning('Your insurance expires soon');
 *   toast.info('New feature available');
 */

(function() {
    'use strict';

    // Create container on load
    let container = null;

    function getContainer() {
        if (container) return container;
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;max-width:420px;width:100%;pointer-events:none;';
        document.body.appendChild(container);
        return container;
    }

    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#16a34a"/><path d="M6 10l3 3 5-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#dc2626"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 6v5M10 13.5v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#2563eb"/><path d="M10 9v5M10 6.5v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    const bgColors = {
        success: '#f0fdf4',
        error: '#fef2f2',
        warning: '#fffbeb',
        info: '#eff6ff'
    };

    const borderColors = {
        success: '#bbf7d0',
        error: '#fecaca',
        warning: '#fde68a',
        info: '#bfdbfe'
    };

    const textColors = {
        success: '#15803d',
        error: '#b91c1c',
        warning: '#92400e',
        info: '#1d4ed8'
    };

    function show(type, message, options = {}) {
        const duration = options.duration || 4000;
        const c = getContainer();

        const el = document.createElement('div');
        el.style.cssText = `
            display:flex;align-items:flex-start;gap:12px;padding:14px 16px;
            background:${bgColors[type]};border:1px solid ${borderColors[type]};
            border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.08);
            font-family:'Inter',system-ui,sans-serif;font-size:14px;color:${textColors[type]};
            pointer-events:auto;cursor:pointer;opacity:0;transform:translateX(40px);
            transition:all 0.3s ease;line-height:1.5;
        `;

        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'flex-shrink:0;margin-top:1px;';
        iconDiv.innerHTML = icons[type];

        const textDiv = document.createElement('div');
        textDiv.style.cssText = 'flex:1;font-weight:500;';
        textDiv.textContent = message;

        const closeBtn = document.createElement('div');
        closeBtn.style.cssText = 'flex-shrink:0;cursor:pointer;opacity:0.5;font-size:18px;line-height:1;margin-top:-2px;';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => { e.stopPropagation(); dismiss(el); };

        el.appendChild(iconDiv);
        el.appendChild(textDiv);
        el.appendChild(closeBtn);
        el.onclick = () => dismiss(el);

        c.appendChild(el);

        // Animate in
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });

        // Auto dismiss
        if (duration > 0) {
            el._timeout = setTimeout(() => dismiss(el), duration);
        }

        // Progress bar
        if (duration > 0) {
            const bar = document.createElement('div');
            bar.style.cssText = `
                position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 10px 10px;
                background:${textColors[type]};opacity:0.3;width:100%;
                transition:width ${duration}ms linear;
            `;
            el.style.position = 'relative';
            el.style.overflow = 'hidden';
            el.appendChild(bar);
            requestAnimationFrame(() => { bar.style.width = '0%'; });
        }

        return el;
    }

    function dismiss(el) {
        if (el._dismissed) return;
        el._dismissed = true;
        if (el._timeout) clearTimeout(el._timeout);
        el.style.opacity = '0';
        el.style.transform = 'translateX(40px)';
        setTimeout(() => el.remove(), 300);
    }

    // Public API
    window.toast = {
        success: (msg, opts) => show('success', msg, opts),
        error: (msg, opts) => show('error', msg, opts),
        warning: (msg, opts) => show('warning', msg, opts),
        info: (msg, opts) => show('info', msg, opts),
        dismiss: dismiss
    };
})();
