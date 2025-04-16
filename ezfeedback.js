/**
 * EzFeedback - Simple Embeddable Feedback Widget
 * A lightweight, customizable feedback widget that can be embedded on any website
 */

(function() {
  'use strict';

  // Configuration defaults
  const DEFAULT_CONFIG = {
    projectId: 'default-project',
    position: 'bottom-right',
    size: 'medium',
    primaryColor: '#0072F5',
    theme: 'light'
  };

  // Main class for the feedback widget
  class EzFeedback {
    constructor(config = {}) {
      // Merge provided config with defaults
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.theme = this.config.theme || 'light';
      this.rating = 0;
      this.container = null;
      this.formVisible = false;

      // Initialize the widget
      this.init();
    }

    init() {
      // Add styles to the document
      this.addStyles();

      // Create the container element
      this.container = document.createElement('div');
      this.container.id = 'ez-feedback-container';

      // Set container position based on config
      this.setPosition();

      // Render the initial button
      this.renderButton();

      // Add container to the document body
      document.body.appendChild(this.container);
    }

    addStyles() {
      // Create stylesheet
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
        #ez-feedback-container {
          position: fixed;
          z-index: 9999;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }
        
        .ez-feedback-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: ${this.config.primaryColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
        }
        
        .ez-feedback-button:hover {
          transform: scale(1.05);
        }
        
        .ez-feedback-form {
          display: none;
          position: absolute;
          width: 300px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 16px;
          animation: ez-slide-up 0.3s ease;
        }
        
        .ez-feedback-form.visible {
          display: block;
        }
        
        .ez-feedback-form.dark {
          background-color: #1a1a1a;
          color: white;
        }
        
        @keyframes ez-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes ez-slide-down {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        
        .ez-feedback-form.hiding {
          animation: ez-slide-down 0.3s ease forwards;
        }
        
        .ez-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .ez-form-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .ez-close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ez-close-button svg {
          stroke: #333;
        }
        
        .ez-feedback-form.dark .ez-close-button svg {
          stroke: #ddd;
        }
        
        .ez-star-rating {
          display: flex;
          gap: 8px;
          margin: 0px 0;
        }
        
        .ez-star {
          cursor: pointer;
          color: #ccc;
          font-size: 24px;
          transition: color 0.2s ease;
        }
        
        .ez-star.active {
          color: ${this.config.primaryColor};
        }
        
        .ez-input-group {
          margin-bottom: 16px;
        }
        
        .ez-input-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .ez-input, .ez-textarea, .ez-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
          background-color: white;
          color: #333;
        }
        
        .ez-feedback-form.dark .ez-input, 
        .ez-feedback-form.dark .ez-textarea, 
        .ez-feedback-form.dark .ez-select {
          background-color: #333;
          border-color: #444;
          color: white;
        }
        
        .ez-textarea {
          min-height: 100px;
          resize: none;
        }
        
        .ez-textarea::placeholder {
          color: #999;
          font-size: 12px;
          opacity: 0.8;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .ez-feedback-form.dark .ez-textarea::placeholder {
          color: #888;
          opacity: 0.6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .ez-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        
        .ez-feedback-form.dark .ez-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23dddddd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        }
        
        .ez-submit-button {
          width: 100%;
          padding: 10px;
          background-color: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .ez-submit-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .ez-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          font-size: 12px;
          color: #888;
        }
        
        .ez-theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
        }
        
        .ez-success-message {
          text-align: center;
          padding: 20px 0;
        }
        
        .ez-success-icon {
          margin: 0 auto;
          width: 48px;
          height: 48px;
          background-color: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4caf50;
          font-size: 24px;
          margin-bottom: 16px;
        }
        
        .ez-feedback-form.dark .ez-success-icon {
          background-color: #1b5e20;
        }
        
        .ez-footer-link {
          color: #333;
          text-decoration: none;
        }
        
        .ez-footer-link:hover {
          color: ${this.config.primaryColor};
        }
        
        .ez-feedback-form.dark .ez-footer-link {
          color: #ddd;
        }
        
        .ez-feedback-form.dark .ez-footer-link:hover {
          color: ${this.config.primaryColor};
        }
      `;

      document.head.appendChild(style);
    }

    setPosition() {
      if (!this.container) return;

      // Set position based on config
      switch (this.config.position) {
        case 'bottom-left':
          this.container.style.bottom = '20px';
          this.container.style.left = '20px';
          break;
        case 'top-right':
          this.container.style.top = '20px';
          this.container.style.right = '20px';
          break;
        case 'top-left':
          this.container.style.top = '20px';
          this.container.style.left = '20px';
          break;
        case 'bottom-right':
        default:
          this.container.style.bottom = '20px';
          this.container.style.right = '20px';
          break;
      }
    }

    renderButton() {
      if (!this.container) return;

      // Clear container
      this.container.innerHTML = '';

      // Create button
      const button = document.createElement('div');
      button.className = 'ez-feedback-button';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      // Create form container
      const formContainer = document.createElement('div');
      formContainer.className = `ez-feedback-form ${this.theme}`;

      // Set form position
      formContainer.style.bottom = '70px';
      formContainer.style.right = '0';
      if (this.config.position === 'bottom-left') {
        formContainer.style.left = '0';
        formContainer.style.right = 'auto';
      } else if (this.config.position === 'top-right') {
        formContainer.style.top = '70px';
        formContainer.style.bottom = 'auto';
      } else if (this.config.position === 'top-left') {
        formContainer.style.top = '70px';
        formContainer.style.left = '0';
        formContainer.style.bottom = 'auto';
        formContainer.style.right = 'auto';
      }

      // Add form content
      formContainer.innerHTML = this.getFormHTML();

      // Add event listeners
      button.addEventListener('click', () => this.toggleForm());

      // Append elements to container
      this.container.appendChild(button);
      this.container.appendChild(formContainer);

      // Initialize event listeners
      this.initEventListeners();
    }

    getFormHTML() {
      return `
        <div class="ez-form-header">
          <h3>Share your feedback</h3>
          <button class="ez-close-button" aria-label="Close feedback form">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="ez-input-group">
          <label style="margin-bottom: 2px;">How would you rate your experience?</label>
          <div class="ez-star-rating">
            <span class="ez-star" data-value="1" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="2" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="3" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="4" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="5" role="button" tabindex="0">★</span>
          </div>
        </div>
        
        <div class="ez-input-group">
          <label for="ez-category">Category</label>
          <select id="ez-category" class="ez-select">
            <option value="">Select a category</option>
            <option value="usability">Usability</option>
            <option value="features">Features</option>
            <option value="performance">Performance</option>
            <option value="design">Design</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="ez-input-group">
          <label for="ez-feedback">Tell us about your experience</label>
          <textarea id="ez-feedback" class="ez-textarea" placeholder="What did you like or dislike? Any suggestions for improvement?" maxlength="500"></textarea>
        </div>
        
        <div class="ez-input-group">
          <label for="ez-email">Email (Optional)</label>
          <input type="email" id="ez-email" class="ez-input" placeholder="your@email.com">
          <small style="color: #888; font-size: 11px; margin-top: 4px; display: block;">We'll never share your email with anyone else</small>
        </div>
        
        <button type="button" class="ez-submit-button" disabled>Submit Feedback</button>
        
        <div class="ez-footer">
          <div>Powered by <b><a class="ez-footer-link" href="https://ezfeedback.com" target="_blank">EzFeedback</a></b></div>
          <button class="ez-theme-toggle" aria-label="Toggle dark mode">
            ${this.getThemeIcon()}
          </button>
        </div>
      `;
    }

    getSuccessHTML() {
      return `
        <div class="ez-form-header">
          <h3>Feedback Submitted</h3>
          <button class="ez-close-button" aria-label="Close feedback form">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="ez-success-message">
          <div class="ez-success-icon">✓</div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Thank you for your feedback!</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">Your feedback has been submitted successfully.</p>
        </div>
        
        <div class="ez-footer">
          <div>Powered by <b><a class="ez-footer-link" href="https://ezfeedback.com" target="_blank">EzFeedback</a></b></div>
          <button class="ez-theme-toggle" aria-label="Toggle dark mode">
            ${this.getThemeIcon()}
          </button>
        </div>
      `;
    }

    getThemeIcon() {
      return this.theme === 'light'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    }

    initEventListeners() {
      if (!this.container) return;

      // Close button
      const closeBtn = this.container.querySelector('.ez-close-button');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideForm());
      }

      // Star rating
      const stars = this.container.querySelectorAll('.ez-star');
      stars.forEach(star => {
        star.addEventListener('click', (e) => {
          const value = parseInt(e.target.getAttribute('data-value') || '0');
          this.setRating(value);
        });

        // Keyboard accessibility
        star.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            const value = parseInt(e.target.getAttribute('data-value') || '0');
            this.setRating(value);
            e.preventDefault();
          }
        });
      });

      // Theme toggle
      const themeToggle = this.container.querySelector('.ez-theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => this.toggleTheme());
      }

      // Form validation
      const textarea = this.container.querySelector('.ez-textarea');
      if (textarea) {
        textarea.addEventListener('input', () => this.validateForm());
      }

      // Submit button
      const submitBtn = this.container.querySelector('.ez-submit-button');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitFeedback());
      }
    }

    setRating(value) {
      this.rating = value;

      const stars = this.container.querySelectorAll('.ez-star');
      stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value') || '0');
        if (starValue <= value) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });

      this.validateForm();
    }

    validateForm() {
      const textarea = this.container.querySelector('.ez-textarea');
      const submitBtn = this.container.querySelector('.ez-submit-button');

      if (submitBtn && textarea) {
        submitBtn.disabled = !(this.rating > 0 && textarea.value.trim().length > 0);
      }
    }

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';

      const form = this.container.querySelector('.ez-feedback-form');
      if (form) {
        form.classList.toggle('dark', this.theme === 'dark');
      }

      const themeToggle = this.container.querySelector('.ez-theme-toggle');
      if (themeToggle) {
        themeToggle.innerHTML = this.getThemeIcon();
      }
    }

    showForm() {
      const form = this.container.querySelector('.ez-feedback-form');
      if (form) {
        form.classList.add('visible');
        this.formVisible = true;
      }
    }

    hideForm() {
      const form = this.container.querySelector('.ez-feedback-form');
      if (form) {
        // Add a class for exit animation
        form.classList.add('hiding');
        this.formVisible = false;

        // Wait for animation to complete before fully hiding
        setTimeout(() => {
          form.classList.remove('visible');
          form.classList.remove('hiding');

          // Reset form after animation completes
          setTimeout(() => {
            if (!this.formVisible) {
              form.innerHTML = this.getFormHTML();
              this.initEventListeners();
              this.rating = 0;
            }
          }, 50);
        }, 300);
      }
    }

    toggleForm() {
      if (this.formVisible) {
        this.hideForm();
      } else {
        this.showForm();
      }
    }

    submitFeedback() {
      // Get form values
      const category = this.container.querySelector('.ez-select').value;
      const feedback = this.container.querySelector('.ez-textarea').value;
      const email = this.container.querySelector('.ez-input').value;

      // Disable submit button
      const submitBtn = this.container.querySelector('.ez-submit-button');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      // Create feedback data object
      const feedbackData = {
        projectId: this.config.projectId,
        rating: this.rating,
        category,
        feedback,
        email: email || null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In a real implementation, you would send this to a server
      console.log('Feedback submitted:', feedbackData);

      // Simulate API call (replace with actual API call in production)
      setTimeout(() => {
        const form = this.container.querySelector('.ez-feedback-form');
        if (form) {
          form.innerHTML = this.getSuccessHTML();

          // Add event listeners to success message elements
          const closeBtn = form.querySelector('.ez-close-button');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideForm());
          }

          const themeToggle = form.querySelector('.ez-theme-toggle');
          if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
          }

          // Auto-close after delay
          setTimeout(() => {
            if (this.formVisible) {
              this.hideForm();
            }
          }, 3000);
        }
      }, 1000);
    }

    // Public method to destroy the widget
    destroy() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // Export the widget to window
  if (typeof window !== 'undefined') {
    // Create the global namespace
    window.EzFeedback = {
      // Method to initialize the widget
      init: function(config = {}) {
        const instance = new EzFeedback(config);
        // Store the instance for programmatic access
        window.EzFeedback._instance = instance;
        return instance;
      }
    };

    // Auto-initialization from script tag
    document.addEventListener('DOMContentLoaded', () => {
      const scriptTag = document.querySelector('script[data-ez-feedback-id]');

      if (scriptTag) {
        const config = {
          projectId: scriptTag.getAttribute('data-ez-feedback-id'),
          position: scriptTag.getAttribute('data-ez-feedback-position'),
          size: scriptTag.getAttribute('data-ez-feedback-size'),
          primaryColor: scriptTag.getAttribute('data-ez-feedback-color'),
          theme: scriptTag.getAttribute('data-ez-feedback-theme')
        };

        // Filter out undefined values
        Object.keys(config).forEach(key => {
          if (config[key] === null || config[key] === undefined) {
            delete config[key];
          }
        });

        window.EzFeedback.init(config);
      }
    });
  }
})();