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

      // New properties for server data
      this.serverData = null;
      this.isLoading = false;

      // Initialize the widget
      this.init();
    }

    init() {
      // Add styles to the document
      this.addStyles();

      // Create the container element but set it to be invisible initially
      this.container = document.createElement('div');
      this.container.id = 'ez-feedback-container';
      this.container.style.display = 'none'; // Hide initially

      // Set container position based on config
      this.setPosition();

      // Add container to the document body (still empty and hidden)
      document.body.appendChild(this.container);

      // Fetch server data before showing anything
      this.fetchServerData();
    }

    fetchServerData() {
      this.isLoading = true;

      // Simulate API call with setTimeout
      setTimeout(() => {
        try {
          // Server data assignment
          this.serverData = {
            primaryColor: '#caa6f7',
            categories: [
              { value: '', label: 'Select a category', isPlaceholder: true },
              { value: 'bug', label: 'Bug Report' },
              { value: 'feature', label: 'Feature Request' },
              { value: 'content', label: 'Content Issue' },
              { value: 'usability', label: 'Usability Problem' },
              { value: 'performance', label: 'Performance Issue' },
              { value: 'praise', label: 'Praise' },
              { value: 'other', label: 'Other' }
            ]
          };

          // Check if categories exist and are not empty
          if (!this.serverData.categories || this.serverData.categories.length === 0) {
            // If no categories, keep the widget hidden
            console.log("No categories available, feedback widget will remain hidden");
            this.isLoading = false;
            return;
          }

          // Clear any existing content and render the button
          this.container.innerHTML = '';

          // Only now make the container visible
          this.container.style.display = 'block';

          // Render the button (without loading state)
          this.renderButton();

          // Update the widget with server data
          this.updateWidgetWithServerData();
          this.isLoading = false;
        } catch (error) {
          console.error("Error fetching server data:", error);
          // Keep the container hidden on error
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
          this.container = null;
        }
      }, 1500);
    }

    // New method: Update widget with fetched server data
    updateWidgetWithServerData() {
      if (!this.serverData) return;

      // Update primary color
      if (this.serverData.primaryColor) {
        this.config.primaryColor = this.serverData.primaryColor;

        // Update styles dynamically - Inject a new style tag to override defaults
        const styleId = 'ez-feedback-dynamic-styles';
        let dynamicStyle = document.getElementById(styleId);
        if (!dynamicStyle) {
            dynamicStyle = document.createElement('style');
            dynamicStyle.id = styleId;
            document.head.appendChild(dynamicStyle);
        }
        
        dynamicStyle.textContent = `
          #ez-feedback-container .ez-feedback-button {
            background-color: ${this.config.primaryColor} !important;
          }
          #ez-feedback-container .ez-star.active {
            color: ${this.config.primaryColor} !important;
          }
          #ez-feedback-container .ez-submit-button {
            background-color: ${this.config.primaryColor} !important;
          }
          #ez-feedback-container .ez-footer-link:hover {
            color: ${this.config.primaryColor} !important;
          }
          #ez-feedback-container.dark .ez-footer-link:hover {
            color: ${this.config.primaryColor} !important; /* Ensure hover works in dark mode too */
          }
        `;
      }

      // Don't check if form is visible - prepare the categories data regardless
      const form = this.container.querySelector('.ez-feedback-form');
      if (form && this.serverData.categories) {
        this.updateCategoryOptions(form);
      }
    }

    // New method: Update category options in the form
    updateCategoryOptions(formElement) {
      const customSelect = formElement.querySelector('.ez-custom-select');
      const selectedDisplay = formElement.querySelector('.ez-select-selected');
      const hiddenInput = formElement.querySelector('#ez-category');
      let optionsContainer = formElement.querySelector('.ez-select-options');

      // If options container exists, remove it first
      if (optionsContainer) {
        optionsContainer.remove();
      }

      // Create a new options container
      optionsContainer = document.createElement('div');
      optionsContainer.className = 'ez-select-options';
      optionsContainer.id = 'ez-select-options-container';

      // NEW: Add dark theme class if in dark mode
      if (this.theme === 'dark') {
        optionsContainer.classList.add('ez-dark-options');
      }

      // Create the options from server data
      if (this.serverData && this.serverData.categories) {
        let placeholderLabel = 'Select a category'; // Default placeholder

        // Add new options from server data
        this.serverData.categories.forEach(category => {
          const option = document.createElement('div');
          option.className = 'ez-select-option';
          if (category.isPlaceholder) {
            option.classList.add('ez-select-placeholder');
            placeholderLabel = category.label; // Use server-defined placeholder if available
          }
          option.setAttribute('data-value', category.value);
          option.textContent = category.label;
          optionsContainer.appendChild(option);
        });

        // Reset selected display and hidden input
        if (selectedDisplay) selectedDisplay.textContent = placeholderLabel;
        if (hiddenInput) hiddenInput.value = '';
      }

      // Append options container to the document body instead of inside the form
      document.body.appendChild(optionsContainer);

      // Hide it initially
      optionsContainer.style.display = 'none';

      // Store a reference to the options container on the custom select
      if (customSelect) {
        customSelect.optionsContainer = optionsContainer;
      }

      // Initialize event listeners for the category options
      this.initCategoryListeners(formElement, optionsContainer);
    }

    initCategoryListeners(formElement, optionsContainer) {
      const customSelect = formElement.querySelector('.ez-custom-select');
      const selectedDisplay = formElement.querySelector('.ez-select-selected');
      const hiddenInput = formElement.querySelector('#ez-category');

      if (!customSelect || !selectedDisplay || !optionsContainer || !hiddenInput) return;

      // Get the options
      const options = optionsContainer.querySelectorAll('.ez-select-option');
      if (!options.length) return;

      // Style the options container for absolute positioning
      optionsContainer.style.position = 'fixed';
      optionsContainer.style.zIndex = '99999999'; // Ultra high z-index

      // Apply dark mode class if needed
      if (this.theme === 'dark') {
        optionsContainer.classList.add('ez-dark-options');
      } else {
        optionsContainer.classList.remove('ez-dark-options');
      }

      // Add click event to the select display element
      selectedDisplay.addEventListener('click', (e) => {
        e.stopPropagation();

        if (optionsContainer.style.display === 'block') {
          // If already shown, hide it
          optionsContainer.style.display = 'none';
          customSelect.classList.remove('active');
        } else {
          // Position and show the dropdown
          const rect = selectedDisplay.getBoundingClientRect();

          optionsContainer.style.top = rect.bottom + 'px';
          optionsContainer.style.left = rect.left + 'px';
          optionsContainer.style.width = rect.width + 'px';
          optionsContainer.style.display = 'block';

          // Update dark mode class before showing
          if (this.theme === 'dark') {
            optionsContainer.classList.add('ez-dark-options');
          } else {
            optionsContainer.classList.remove('ez-dark-options');
          }

          customSelect.classList.add('active');
        }
      });

      // Add click handlers to each option
      options.forEach(option => {
        option.addEventListener('click', () => {
          // Skip if this is the placeholder
          if (option.classList.contains('ez-select-placeholder')) {
            return;
          }

          const value = option.getAttribute('data-value');
          selectedDisplay.textContent = option.textContent;
          hiddenInput.value = value;

          optionsContainer.style.display = 'none';
          customSelect.classList.remove('active');

          this.validateForm();
        });
      });

      // Close dropdown when clicking outside
      this._handleDocumentClick = (e) => {
        if (!customSelect.contains(e.target) && !optionsContainer.contains(e.target)) {
          optionsContainer.style.display = 'none';
          customSelect.classList.remove('active');
        }
      };

      // Ensure we don't add multiple listeners
      document.removeEventListener('click', this._handleDocumentClick);
      document.addEventListener('click', this._handleDocumentClick);
    }

    addStyles() {
      // Create stylesheet
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
        #ez-feedback-container {
          position: fixed;
          z-index: 999999;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }
        
         .ez-feedback-form .ez-animate-item {
            opacity: 0;
            transform: translateY(15px);
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          
          .ez-feedback-form .ez-animate-item.ez-animate-visible {
            opacity: 1;
            transform: translateY(0);
          }
        
        .ez-input:focus, 
        .ez-textarea:focus, 
        .ez-select:focus {
          outline: none;
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
          -webkit-tap-highlight-color: transparent;
        }
        
        .ez-feedback-button:hover {
          transform: scale(1.05);
        }
        
        .ez-feedback-form {
          display: none;
          position: absolute;
          width: 350px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 16px;
          animation: ez-slide-up 0.3s ease;
          z-index: 999999;
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
          font-weight: bold;
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
          font-size: 40px;
          line-height: 1;
          transition: color 0.7s ease;
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
          margin-top: 0px;
        }
        
        .ez-feedback-form .ez-submit-button:disabled {
          opacity: 0.5 !important;
          background-color: ${this.config.primaryColor} !important;
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
        
        .ez-feedback-form.dark .ez-theme-toggle {
          color: #ddd;
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
        
        .ez-custom-select {
          position: relative;
          width: 100%;
          z-index: 1;
        }
        
        .ez-select-selected {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
          background-color: white;
          color: #333;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          user-select: none;
        }
        
        .ez-select-selected:focus {
          outline: none;
        }
        
        .ez-feedback-form.dark .ez-select-selected {
          background-color: #333;
          border-color: #444;
          color: white;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23dddddd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        }
        
        .ez-select-options {
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .ez-feedback-form.dark + .ez-select-options,
        body.dark .ez-select-options {
          background-color: #333;
          border-color: #444;
          color: white;
        }
        
        .ez-select-options.ez-dark-options {
          background-color: #333;
          border-color: #444;
          color: white;
        }
        
        .ez-feedback-form.dark .ez-select-options {
          background-color: #333;
          border-color: #444;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .ez-custom-select.active {
          z-index: 9999999;
        }
        
        .ez-custom-select.active .ez-select-options {
          display: block;
        }
        
        .ez-select-option {
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        
        .ez-select-options.ez-dark-options .ez-select-option {
          color: white;
        }
        
        .ez-feedback-form.dark .ez-select-option {
          color: white;
        }
        
        .ez-select-option:hover {
          background-color: #f5f5f5;
        }
        
        .ez-feedback-form.dark .ez-select-option:hover {
          background-color: #444;
        }
        
        .ez-select-options.ez-dark-options .ez-select-option:hover {
          background-color: #444;
        }
        
        .ez-select-option:last-child {
          border-radius: 0 0 6px 6px;
        }
        
        .ez-select-placeholder {
          color: #888 !important;
          cursor: default !important;
        }
        
        .ez-select-placeholder:hover {
          background-color: transparent !important;
        }
        
        .ez-select-options.ez-dark-options .ez-select-placeholder {
          color: #666 !important;
        }
        
        .ez-feedback-form.dark .ez-select-placeholder {
          color: #666 !important;
        }
        
        #ez-select-options-container {
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          max-height: 200px;
          overflow-y: auto;
          z-index: 99999999;
          -ms-overflow-style: none;  /* Internet Explorer and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        
        #ez-select-options-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Dark mode class for the detached dropdown */
        #ez-select-options-container.ez-dark-options {
          background-color: #333 !important;
          border-color: #444 !important;
        }
        
        /* Option styling */
        #ez-select-options-container .ez-select-option {
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        
        /* Dark mode option styling */
        #ez-select-options-container.ez-dark-options .ez-select-option {
          color: white !important;
        }
        
        /* Hover states */
        #ez-select-options-container .ez-select-option:hover {
          background-color: #f5f5f5;
        }
        
        #ez-select-options-container.ez-dark-options .ez-select-option:hover {
          background-color: #444 !important;
        }
        
        /* Placeholder styling */
        #ez-select-options-container .ez-select-placeholder {
          color: #888 !important;
          cursor: default !important;
        }
        
        #ez-select-options-container .ez-select-placeholder:hover {
          background-color: transparent !important;
        }
        
        #ez-select-options-container.ez-dark-options .ez-select-placeholder {
          color: #666 !important;
        }
        
        /* Loading state for button */
        .ez-feedback-button.ez-loading {
          cursor: wait;
        }
        
        .ez-loading-spinner circle {
          stroke: white; /* Color of the spinner */
          stroke-dashoffset: 80; /* Adjust for desired gap */
          animation: ez-spinner-dash 1.5s ease-in-out infinite;
        }

        @keyframes ez-spinner-dash {
          0% { stroke-dashoffset: 80; }
          50% { stroke-dashoffset: 20; transform: rotate(135deg); }
          100% { stroke-dashoffset: 80; transform: rotate(450deg); }
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

      // Create button with normal (non-loading) state
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
      button.addEventListener('click', () => {
        // If still loading data, don't open form yet
        if (this.isLoading) return;
        this.toggleForm();
      });

      // Append elements to container
      this.container.appendChild(button);
      this.container.appendChild(formContainer);

      // Initialize event listeners
      this.initEventListeners();
    }

    getFormHTML() {
      return `
        <div class="ez-form-header ez-animate-item">
          <h3>SHARE YOUR FEEDBACK</h3> 
          <button class="ez-close-button" aria-label="Close feedback form">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="ez-input-group ez-animate-item">
          <label>How would you rate your experience?</label>
          <div class="ez-star-rating">
            <span class="ez-star" data-value="1" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="2" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="3" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="4" role="button" tabindex="0">★</span>
            <span class="ez-star" data-value="5" role="button" tabindex="0">★</span>
          </div>
        </div>
        
        <div class="ez-input-group ez-animate-item">
          <label for="ez-category">Category</label>
          <div class="ez-custom-select">
            <div class="ez-select-selected" tabindex="0">Select a category</div>
            <div class="ez-select-options">
              <!-- Categories will be dynamically populated from serverData -->
            </div>
            <input type="hidden" id="ez-category" value="">
          </div>
        </div>
        
        <div class="ez-input-group ez-animate-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="ez-feedback">Tell us about your experience</label>
            <span id="ez-char-counter" style="color: #888; font-size: 11px;">0/500</span>
          </div>
          <textarea id="ez-feedback" class="ez-textarea" placeholder="What did you like or dislike? Any suggestions for improvement?" maxlength="500"></textarea>
        </div>
        
        <div class="ez-input-group ez-animate-item" style="margin-top: -8px;"> <!-- Margin top -8px due to the extra space at the bottom of the Textarea-->
          <label for="ez-email">Email (Optional)</label>
          <input type="email" id="ez-email" class="ez-input" placeholder="your@email.com">
          <small style="color: #888; font-size: 11px; margin-top: 4px; display: block;">We'll never share your email with anyone else</small>
        </div>
        
        <button type="button" class="ez-submit-button ez-animate-item" disabled>Submit Feedback</button>
        
        <div class="ez-footer ez-animate-item">
          <div>Powered by <b><a class="ez-footer-link" href="https://ezfeedback.com" target="_blank">EzFeedback</a></b></div>
          <button class="ez-theme-toggle" aria-label="Toggle dark mode">
            ${this.getThemeIcon()}
          </button>
        </div>
      `;
    }

    getSuccessHTML() {
      return `
        <div class="ez-form-header ez-animate-item">
          <h3>Feedback Sent</h3>
          <button class="ez-close-button" aria-label="Close feedback form">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="ez-success-message ez-animate-item">
          <div class="ez-success-icon">✓</div>
          <h3 style="margin: 0 0 2px 0; font-size: 16px; font-weight: 600;">Thanks!</h3>
          <p style="margin: 0; font-size: 14px; font-weight: 400;">Your feedback has been submitted successfully</p>
        </div>
        
        <div class="ez-footer ez-animate-item" style="margin-top: 30px;">
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

      const form = this.container.querySelector('.ez-feedback-form');
      if (!form) return; // Ensure form exists

      // Close button
      const closeBtn = form.querySelector('.ez-close-button');
      if (closeBtn) {
        // Clone and replace to remove existing listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => this.hideForm());
      }

      // Star rating
      const stars = form.querySelectorAll('.ez-star');
      stars.forEach(star => {
        // Clone and replace to remove existing listeners
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);

        newStar.addEventListener('click', (e) => {
          const value = parseInt(e.target.getAttribute('data-value') || '0');
          this.setRating(value);
        });

        // Keyboard accessibility
        newStar.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            const value = parseInt(e.target.getAttribute('data-value') || '0');
            this.setRating(value);
            e.preventDefault();
          }
        });
      });

      // Theme toggle - Fixed event binding
      const themeToggle = form.querySelector('.ez-theme-toggle');
      if (themeToggle) {
        // Remove any existing listeners to prevent duplicates
        const newThemeToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);

        // Add the event listener to the new element
        newThemeToggle.addEventListener('click', () => {
          this.toggleTheme();
        });
      }

      // Form validation inputs
      const textarea = form.querySelector('.ez-textarea');
      if (textarea) {
        // Clone and replace to remove existing listeners
        const newTextarea = textarea.cloneNode(true);
        textarea.parentNode.replaceChild(newTextarea, textarea);
        newTextarea.addEventListener('input', () => {
          // Original validation function
          this.validateForm();

          // Update character counter
          const counter = form.querySelector('#ez-char-counter');
          if (counter) {
            const currentLength = newTextarea.value.length;
            counter.textContent = `${currentLength}/500`;
          }
        });
      }

      // Submit button
      const submitBtn = form.querySelector('.ez-submit-button');
      if (submitBtn) {
        // Clone and replace to remove existing listeners
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        newSubmitBtn.addEventListener('click', () => this.submitFeedback());
      }

      // Custom Select Dropdown Logic - DON'T clone this as it breaks category functionality
      const customSelect = form.querySelector('.ez-custom-select');
      const selectedDisplay = form.querySelector('.ez-select-selected');

      if (customSelect && selectedDisplay) {
        // Remove previous click listeners by using element.onclick instead of addEventListener
        selectedDisplay.onclick = (e) => {
          e.stopPropagation(); // Prevent click from closing immediately via document listener
          customSelect.classList.toggle('active');
        };

        // Keyboard accessibility for select
        selectedDisplay.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            customSelect.classList.toggle('active');
            e.preventDefault();
          } else if (e.key === 'Escape') { // Close on Escape
            customSelect.classList.remove('active');
            e.preventDefault();
          }
        };

        // Initialize category listeners without replacing elements
        this.initCategoryListeners(form);
      }

      // Close dropdown when clicking outside - attached to document
      // Use a named function for easy removal later if needed
      if (this._handleDocumentClick) {
        document.removeEventListener('click', this._handleDocumentClick);
      }

      this._handleDocumentClick = (e) => {
        if (customSelect && !customSelect.contains(e.target)) {
          customSelect.classList.remove('active');
        }
      };

      document.addEventListener('click', this._handleDocumentClick);
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
      const categoryInput = this.container.querySelector('#ez-category');
      const submitBtn = this.container.querySelector('.ez-submit-button');

      if (submitBtn && textarea && categoryInput) {
        const categorySelected = categoryInput.value.trim().length > 0;
        submitBtn.disabled = !(this.rating > 0 && textarea.value.trim().length > 0 && categorySelected);
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

      const optionsContainer = document.getElementById('ez-select-options-container');
      if (optionsContainer) {
        optionsContainer.classList.toggle('ez-dark-options', this.theme === 'dark');
      }
    }

    animateFormElements() {
      const animatedItems = this.container.querySelectorAll('.ez-animate-item');
      if (!animatedItems.length) return;

      // Stagger the animation of each item
      animatedItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('ez-animate-visible');
        }, 75 * index); // 75ms delay between each item
      });
    }

    showForm() {
      // Modified: Check loading state and update categories
      if (this.isLoading) return; // Don't show form if still loading data

      const form = this.container.querySelector('.ez-feedback-form');
      if (form) {
        // Ensure category options are updated with server data *before* showing
        if (this.serverData && this.serverData.categories) {
          this.updateCategoryOptions(form); // Update options
        }

        form.classList.remove('hiding'); // Ensure hiding class is removed
        form.classList.add('visible');
        this.formVisible = true;

        // Reset animation classes before showing
        const animatedItems = form.querySelectorAll('.ez-animate-item');
        animatedItems.forEach(item => {
          item.classList.remove('ez-animate-visible');
        });

        // Start staggered animation after form is visible
        setTimeout(() => {
          this.animateFormElements();
        }, 50); // Small delay to ensure the form is visible first

        // Re-initialize all event listeners for the form content
        this.initEventListeners();
      }
    }

    hideForm() {
      const form = this.container.querySelector('.ez-feedback-form');
      if (form && this.formVisible) { // Only hide if currently visible
        // Add a class for exit animation
        form.classList.add('hiding');
        this.formVisible = false;

        // Reset animation classes
        const animatedItems = form.querySelectorAll('.ez-animate-item');
        animatedItems.forEach(item => {
          item.classList.remove('ez-animate-visible');
        });

        // Wait for animation to complete before fully hiding and resetting
        form.addEventListener('animationend', () => {
          if (!this.formVisible) { // Check if it wasn't reopened during animation
            form.classList.remove('visible');
            form.classList.remove('hiding');

            // Reset form content *after* animation
            form.innerHTML = this.getFormHTML();
            this.rating = 0; // Reset rating state

            // Apply theme class correctly after reset
            form.classList.toggle('dark', this.theme === 'dark');

            // If we have server data, update dynamic parts (like categories)
            if (this.serverData) {
              this.updateCategoryOptions(form); // Update categories for next open
            }

            // Re-attach essential listeners after innerHTML reset
            this.initEventListeners();
          }
        }, { once: true }); // Use {once: true} to auto-remove listener

        // Fallback timeout in case animationend event doesn't fire
        setTimeout(() => {
          if (!this.formVisible && form.classList.contains('hiding')) {
            form.classList.remove('visible');
            form.classList.remove('hiding');
            form.innerHTML = this.getFormHTML();
            this.rating = 0;
            form.classList.toggle('dark', this.theme === 'dark');
            if (this.serverData) {
              this.updateCategoryOptions(form);
            }
            this.initEventListeners();
          }
        }, 350); // Slightly longer than animation
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
      // Prevent multiple submissions
      if (this._isSubmitting) return;
      this._isSubmitting = true;

      try {
        // Get form values
        const category = this.container.querySelector('#ez-category').value;
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

            // Re-add event listeners to success message elements
            const closeBtn = form.querySelector('.ez-close-button');
            if (closeBtn) {
              closeBtn.addEventListener('click', () => this.hideForm());
            }

            const themeToggle = form.querySelector('.ez-theme-toggle');
            if (themeToggle) {
              themeToggle.addEventListener('click', () => this.toggleTheme());
            }

            // Animate the success message elements
            setTimeout(() => {
              this.animateFormElements();
            }, 50);

            // Auto-close after delay
            setTimeout(() => {
              if (this.formVisible) {
                this.hideForm();
              }
            }, 5000);
          }

          // Reset submission flag after completion
          this._isSubmitting = false;
        }, 1000);
      } catch (error) {
        console.error("Error submitting feedback:", error);
        this._isSubmitting = false;
      }
    }

    destroy() {
      // Remove the options container if it exists
      const optionsContainer = document.getElementById('ez-select-options-container');
      if (optionsContainer) {
        optionsContainer.remove();
      }

      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      // Remove document click listener if it exists
      if (this._handleDocumentClick) {
        document.removeEventListener('click', this._handleDocumentClick);
      }

      // Remove dynamic style tag
      const dynamicStyle = document.getElementById('ez-feedback-dynamic-styles');
      if (dynamicStyle) {
        dynamicStyle.parentNode.removeChild(dynamicStyle);
      }

      // Nullify references to help GC
      this.container = null;
      this.config = null;
      this.serverData = null;
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
      const scriptTag = document.querySelector('script[data-project-id]');

      if (scriptTag) {
        const config = {
          projectId: scriptTag.getAttribute('data-project-id'),
          position: scriptTag.getAttribute('data-position'),
          primaryColor: scriptTag.getAttribute('data-color'),
          theme: scriptTag.getAttribute('data-theme')
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
