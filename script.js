class QRGenerator {
    constructor() {
        this.currentType = 'text';
        this.qrCanvas = document.querySelector('.qr-display');
        this.qrPlaceholder = document.querySelector('.qr-placeholder');
        this.qrActions = document.querySelector('.qr-actions');
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupTypeSelector();
    }

    bindEvents() {
        // Type selector buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTypeChange(e));
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => this.generateQR());

        // Action buttons
        document.getElementById('download-btn').addEventListener('click', () => this.downloadQR());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyQR());
        document.getElementById('new-btn').addEventListener('click', () => this.resetGenerator());

        // Input change listeners for real-time generation
        this.setupInputListeners();

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupInputListeners() {
        const inputs = [
            'text-input',
            'url-input',
            'wifi-ssid',
            'wifi-password',
            'wifi-security',
            'phone-input',
            'email-input',
            'email-subject',
            'email-body',
            'sms-phone',
            'sms-message'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.debounce(() => this.autoGenerate(), 500));
            }
        });
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    handleTypeChange(e) {
        const button = e.currentTarget;
        const type = button.getAttribute('data-type');
        
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active form
        document.querySelectorAll('.input-form').forEach(form => form.classList.remove('active'));
        document.querySelector(`[data-form="${type}"]`).classList.add('active');
        
        this.currentType = type;
        this.resetQRDisplay();
    }

    setupTypeSelector() {
        // Set initial state
        document.querySelector('.type-btn[data-type="text"]').classList.add('active');
        document.querySelector('.input-form[data-form="text"]').classList.add('active');
    }

    generateQR() {
        const data = this.getQRData();
        
        if (!data) {
            this.showError('Lütfen gerekli alanları doldurun');
            return;
        }

        this.showLoading();
        
        try {
            // Clear previous QR
            this.qrCanvas.innerHTML = '';
            
            // Create new QR code instance
            const qr = new QRCode(this.qrCanvas, {
                text: data,
                width: 300,
                height: 300,
                colorDark: '#1F2937',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.M
            });
            
            this.showQRResult();
            this.trackEvent('qr_generated', this.currentType);
        } catch (error) {
            console.error(error);
            this.showError('QR kod oluşturulurken bir hata oluştu');
        }
    }

    autoGenerate() {
        const data = this.getQRData();
        if (data && data.length > 0) {
            this.generateQR();
        }
    }

    getQRData() {
        switch (this.currentType) {
            case 'text':
                return document.getElementById('text-input').value.trim();
            
            case 'url':
                const url = document.getElementById('url-input').value.trim();
                return url ? (url.startsWith('http') ? url : `https://${url}`) : '';
            
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const password = document.getElementById('wifi-password').value;
                const security = document.getElementById('wifi-security').value;
                
                if (!ssid) return '';
                
                if (security === 'nopass') {
                    return `WIFI:S:${ssid};T:nopass;;`;
                } else {
                    return `WIFI:S:${ssid};T:${security};P:${password};;`;
                }
            
            case 'phone':
                const phone = document.getElementById('phone-input').value.trim();
                return phone ? `tel:${phone}` : '';
            
            case 'email':
                const email = document.getElementById('email-input').value.trim();
                const subject = document.getElementById('email-subject').value.trim();
                const body = document.getElementById('email-body').value.trim();
                
                if (!email) return '';
                
                let emailData = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length > 0) emailData += `?${params.join('&')}`;
                
                return emailData;
            
            case 'sms':
                const smsPhone = document.getElementById('sms-phone').value.trim();
                const message = document.getElementById('sms-message').value.trim();
                
                if (!smsPhone) return '';
                
                return `sms:${smsPhone}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
            
            default:
                return '';
        }
    }

    showLoading() {
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.classList.add('loading');
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Oluşturuluyor...';
        generateBtn.disabled = true;
    }

    showQRResult() {
        // Hide placeholder and show canvas
        this.qrPlaceholder.style.display = 'none';
        this.qrCanvas.style.display = 'block';
        this.qrActions.style.display = 'flex';
        
        // Reset generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> QR Kod Oluştur';
        generateBtn.disabled = false;
        
        // Add animation
        this.qrCanvas.classList.add('fade-in');
        this.qrActions.classList.add('slide-up');
    }

    showError(message) {
        // Reset generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> QR Kod Oluştur';
        generateBtn.disabled = false;
        
        // Show error message
        this.showNotification(message, 'error');
    }

    resetQRDisplay() {
        this.qrPlaceholder.style.display = 'flex';
        this.qrCanvas.style.display = 'none';
        this.qrActions.style.display = 'none';
    }

    resetGenerator() {
        // Clear all inputs
        document.querySelectorAll('.input-form input, .input-form textarea').forEach(input => {
            input.value = '';
        });
        
        // Reset to text type
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.type-btn[data-type="text"]').classList.add('active');
        
        document.querySelectorAll('.input-form').forEach(form => form.classList.remove('active'));
        document.querySelector('.input-form[data-form="text"]').classList.add('active');
        
        this.currentType = 'text';
        this.resetQRDisplay();
    }

    downloadQR() {
        try {
            const canvas = this.qrCanvas.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `qr-code-${this.currentType}-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
                
                this.showNotification('QR kod başarıyla indirildi!', 'success');
                this.trackEvent('qr_downloaded', this.currentType);
            }
        } catch (error) {
            console.error(error);
            this.showNotification('İndirme sırasında bir hata oluştu', 'error');
        }
    }

    async copyQR() {
        try {
            const canvas = this.qrCanvas.querySelector('canvas');
            if (canvas) {
                canvas.toBlob(async (blob) => {
                    try {
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        this.showNotification('QR kod panoya kopyalandı!', 'success');
                        this.trackEvent('qr_copied', this.currentType);
                    } catch (error) {
                        console.error(error);
                        this.fallbackCopy();
                    }
                });
            }
        } catch (error) {
            console.error(error);
            this.fallbackCopy();
        }
    }

    fallbackCopy() {
        try {
            const canvas = this.qrCanvas.querySelector('canvas');
            if (canvas) {
                const dataURL = canvas.toDataURL();
                
                // Create a temporary link for fallback
                const tempInput = document.createElement('input');
                tempInput.value = dataURL;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                this.showNotification('QR kod bağlantısı panoya kopyalandı!', 'success');
            }
        } catch (error) {
            this.showNotification('Kopyalama sırasında bir hata oluştu', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: this.getNotificationColor(type),
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: '1000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    }

    trackEvent(eventName, type) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': 'QR Generator',
                'event_label': type,
                'value': 1
            });
        }
    }
}

// Utility Functions
class Utils {
    static formatPhoneNumber(phone) {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Format Turkish phone numbers
        if (cleaned.startsWith('90')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+90${cleaned.substring(1)}`;
        } else if (cleaned.length === 10) {
            return `+90${cleaned}`;
        }
        
        return phone;
    }

    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validateURL(url) {
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch {
            return false;
        }
    }
}

// Input Formatters
class InputFormatters {
    static setupPhoneFormatting() {
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.value = Utils.formatPhoneNumber(value);
            });
        });
    }

    static setupURLFormatting() {
        document.getElementById('url-input').addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            if (value && !value.startsWith('http')) {
                e.target.value = `https://${value}`;
            }
        });
    }

    static setupEmailValidation() {
        document.getElementById('email-input').addEventListener('blur', (e) => {
            const email = e.target.value.trim();
            if (email && !Utils.validateEmail(email)) {
                e.target.style.borderColor = 'var(--error-color)';
            } else {
                e.target.style.borderColor = 'var(--border-color)';
            }
        });
    }
}

// PWA Support - Disabled (no sw.js file)
class PWASupport {
    static init() {
        // Service Worker disabled - no sw.js file available
        console.log('PWA support disabled - no service worker file');
    }
}

// Keyboard Shortcuts
class KeyboardShortcuts {
    static init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to generate QR
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('generate-btn').click();
            }
            
            // Ctrl/Cmd + D to download
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                const downloadBtn = document.getElementById('download-btn');
                if (downloadBtn.style.display !== 'none') {
                    e.preventDefault();
                    downloadBtn.click();
                }
            }
            
            // Ctrl/Cmd + C to copy (when QR is visible)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const copyBtn = document.getElementById('copy-btn');
                if (copyBtn.style.display !== 'none' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    copyBtn.click();
                }
            }
            
            // Escape to reset
            if (e.key === 'Escape') {
                const newBtn = document.getElementById('new-btn');
                if (newBtn.style.display !== 'none') {
                    newBtn.click();
                }
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main QR generator
    new QRGenerator();
    
    // Setup input formatters
    InputFormatters.setupPhoneFormatting();
    InputFormatters.setupURLFormatting();
    InputFormatters.setupEmailValidation();
    
    // Initialize PWA support
    PWASupport.init();
    
    // Setup keyboard shortcuts
    KeyboardShortcuts.init();
    
    // Add loading animation to page
    document.body.classList.add('fade-in');
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any ongoing operations
    } else {
        // Page is visible, resume operations
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    // Track page load time
    if ('performance' in window) {
        const loadTime = Math.round(performance.now());
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                'event_category': 'Performance',
                'value': loadTime
            });
        }
    }
});