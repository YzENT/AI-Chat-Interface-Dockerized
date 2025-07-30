import '../../../css/auth/TermsAndConditionsModal.css'; 
import { X } from 'lucide-react';

export default function TermsAndConditionsModal({ closeTermsModal, acceptTerms}) {
    return (
        <div className="modal-overlay" onClick={closeTermsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Terms and Conditions</h2>
                    <button 
                        type="button"
                        onClick={closeTermsModal}
                        className="modal-close"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="terms-content">
                        <h3>1. Acceptance of Terms</h3>
                        <p>By using LifeCare AI, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
                        
                        <h3>2. Description of Service</h3>
                        <p>LifeCare AI is an artificial intelligence-powered health assistant designed to provide general health information and guidance. It is not intended to replace professional medical advice, diagnosis, or treatment.</p>
                        
                        <h3>3. Medical Disclaimer</h3>
                        <p>The information provided by LifeCare AI is for educational purposes only and should not be considered as professional medical advice. Always consult with a qualified healthcare provider for medical concerns.</p>
                        
                        <h3>4. User Responsibilities</h3>
                        <ul>
                            <li>Provide accurate information when using the service</li>
                            <li>Use the service responsibly and ethically</li>
                            <li>Maintain the confidentiality of your account credentials</li>
                            <li>Report any issues or concerns promptly</li>
                        </ul>
                        
                        <h3>5. Privacy and Data Protection</h3>
                        <p>We are committed to protecting your privacy and handling your personal data in accordance with applicable privacy laws. Your conversations and health information are encrypted and secure.</p>
                        
                        <h3>6. Limitation of Liability</h3>
                        <p>LifeCare AI and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the service.</p>
                        
                        <h3>7. Changes to Terms</h3>
                        <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
                        
                        <h3>8. Contact Information</h3>
                        <p>For questions about these terms, please contact us at support@lifecareai.com</p>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button 
                        type="button"
                        onClick={closeTermsModal}
                        className="modal-button secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={acceptTerms}
                        className="modal-button primary"
                    >
                        Accept Terms
                    </button>
                </div>
            </div>
        </div>
    );
}