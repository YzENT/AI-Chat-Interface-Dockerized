import React, { useEffect, useRef, useState } from 'react';
import '../../../../css/sidebar/admin/KnowledgeHistoryPage.css';
import {toast} from "react-toastify";
import { Heater, ChevronsRight, ChevronsDown } from 'lucide-react';

export default function KnowledgeHistoryPage() {

    const [isLoading, setIsLoading] = useState(true);
    const [knowledge, setKnowledge] = useState([]);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const totalPages = Math.ceil(knowledge.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentKnowledge = knowledge.slice(startIndex, endIndex);
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        getKnowledge();
    }, []);

    const getKnowledge = async () => {
        try {
            const response = await fetch('/api/chatbot/knowledge', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            setKnowledge(responseData.data.knowledge);
            // setKnowledge([].concat(...Array(20).fill(responseData.data.knowledge)));
        } catch (error) {
            setKnowledge([]);
            toast.error(error.message || 'Failed to fetch knowledge from server.');
        } finally {
            setIsLoading(false);
        }
    }

    const toggleExpanded = (id) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedCards(newExpanded);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        setExpandedCards(new Set()); // Clear expanded cards when changing page
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const renderKnowledgeValue = (val, depth = 0) => {
        if (val === null || val === undefined) {
            return 'undefined';
        }
        
        // If val is type array
        if (Array.isArray(val)) {
            if (val.length === 0) {
                return '[ ]';
            }

            // Returns list
            return (
                <ul className='knowledge-metadata-list'>
                    {val.map((item, index) => (
                        <li key={index} className='knowledge-metadata-array'>{item}</li>
                    ))}
                </ul>
            );
        }
        
        // Creates a expandable button, and prints it out as it's array
        if (typeof val === 'object') {
            const objectKeys = Object.keys(val);

            if (objectKeys.length === 0) {
                return "{ }";
            }

            return (
                <div className='knowledge-expandable-object'>
                    {objectKeys.map((key) => (
                        <ExpandableKey
                            key={key}
                            label={key}
                            value={val[key]}
                            depth={depth}
                        />
                    ))}
                </div>
            );
        }
        
        // Default return
        return String(val);
    };

    const ExpandableKey = ({ label, value, depth }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div className="knowledge-nested-item">
                <button
                    className="knowledge-expand-button"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronsDown size={16}/> : <ChevronsRight size={16}/>}
                    {label.toUpperCase()}
                    
                </button>
                
                {isExpanded && (
                    <div className="knowledge-nested-value">
                        {renderKnowledgeValue(value, depth + 1)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='knowledge-view-page'>
            <div className='knowledge-header'>
                <h1 className='knowledge-title'>AI Knowledge History</h1>
            </div>

            <div className='knowledge-body'>
                <div className='knowledge-container'>
                    <div className='knowledge-summary'>
                        <h2 className='knowledge-section-title'>Page {currentPage}</h2>
                    </div>

                    {isLoading ? (
                        <div className="knowledge-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading knowledges...</p>
                        </div>
                    ) : knowledge.length === 0 ? (
                        <div className="knowledge-empty">
                            <Heater size={48} className="text-gray-500" />
                            <p>No knowledges found.</p>
                        </div>
                    ) : (
                        <div className='knowledge-card-list'>
                            
                            {/* Nightmare */}
                            {currentKnowledge.map((data) => {
                                const isExpanded = expandedCards.has(data.id);
                                return (
                                    <div key={data.id} className='knowledge-row'>
                                        <div className='knowledge-row-header' onClick={() => toggleExpanded(data.id)}>
                                            <div className='knowledge-main-content'>
                                                <div className='knowledge-title-section'>
                                                    <h3 className='knowledge-main-title'>
                                                        {data.metadata?.title || data.metadata?.filename || data.metadata?.temporal_info || 'Unable to determine knowledge title'}
                                                    </h3>
                                                    <div className='knowledge-preview-content'>
                                                        {data.content.length > 150 
                                                            ? `${data.content.substring(0, 150)}...` 
                                                            : data.content
                                                        }
                                                    </div>
                                                </div>
                                                <div className='knowledge-basic-info'>
                                                    <span className='knowledge-source-type'>
                                                        {data.source_type}
                                                    </span>
                                                    <span className='knowledge-timestamp'>
                                                        {new Date(data.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='knowledge-expand-arrow'>
                                                <svg 
                                                    className={`knowledge-expand-icon ${isExpanded ? 'expanded' : ''}`}
                                                    width="20" 
                                                    height="20" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2"
                                                >
                                                    <polyline points="6,9 12,15 18,9"></polyline>
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className='knowledge-expanded-details'>
                                                <div className='knowledge-details-grid'>

                                                    <div className='knowledge-detail-section'>
                                                        <h4 className='knowledge-detail-section-title'>Full Content</h4>
                                                        <div className='knowledge-full-content'>
                                                            {data.content}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className='knowledge-detail-section'>
                                                        <h4 className='knowledge-detail-section-title'>Metadata</h4>
                                                        <div className='metadata-grid'>

                                                            {/* Need to change KB (file size) */}
                                                            {/* Fix metadata (enhanced object) */}
                                                            {data.metadata && Object.entries(data.metadata).map(([key, value]) => (
                                                                <div key={key} className='metadata-item'>
                                                                    <span className='metadata-label'>{key.toUpperCase()}:</span>
                                                                    <span className='metadata-value'>{renderKnowledgeValue(value)}</span>
                                                                </div>
                                                            ))}

                                                        </div>
                                                    </div>
                                                    
                                                    <div className='knowledge-detail-section'>
                                                        <h4 className='detail-section-title'>Technical Info</h4>
                                                        <div className='technical-info'>
                                                            <div className='metadata-item'>
                                                                <span className='metadata-label'>ID:</span>
                                                                <span className='metadata-value knowledge-id-full'>{data.id}</span>
                                                            </div>
                                                            <div className='metadata-item'>
                                                                <span className='metadata-label'>Source Type:</span>
                                                                <span className='metadata-value'>{data.source_type}</span>
                                                            </div>
                                                            <div className='metadata-item'>
                                                                <span className='metadata-label'>Timestamp:</span>
                                                                <span className='metadata-value'>{data.timestamp}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            )}

                            {/* Another nightmare */}
                            {knowledge.length > itemsPerPage && (
                                <div className='knowledge-pagination-container'>
                                    <div className='knowledge-pagination-info'>
                                        Showing {startIndex + 1}-{Math.min(endIndex, knowledge.length)} of {knowledge.length} entries
                                    </div>
                                    <div className='knowledge-pagination-controls'>
                                        <button 
                                            onClick={prevPage} 
                                            disabled={currentPage === 1}
                                            className='knowledge-pagination-btn'
                                        >
                                            Previous
                                        </button>

                                        <div className='knowledge-pagination-pages'>
                                            {(() => {
                                                const delta = 2; // Number of pages to show around current page
                                                const range = [];
                                                const rangeWithDots = [];
                                                
                                                // Always show first page
                                                range.push(1);
                                                
                                                // Add pages around current page
                                                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                                                    range.push(i);
                                                }
                                                
                                                // Always show last page (if more than 1 page)
                                                if (totalPages > 1) {
                                                    range.push(totalPages);
                                                }
                                                
                                                // Remove duplicates and sort
                                                const uniqueRange = [...new Set(range)].sort((a, b) => a - b);
                                                
                                                // Add ellipsis where needed
                                                let prev = 0;
                                                for (const page of uniqueRange) {
                                                    if (page - prev > 1) {
                                                        rangeWithDots.push('...');
                                                    }
                                                    rangeWithDots.push(page);
                                                    prev = page;
                                                }
                                                
                                                return rangeWithDots.map((item, index) => {
                                                    if (item === '...') {
                                                        return (
                                                            <span key={`ellipsis-${index}`} className='knowledge-pagination-ellipsis'>
                                                                ...
                                                            </span>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={item}
                                                            onClick={() => goToPage(item)}
                                                            className={`knowledge-pagination-page ${currentPage === item ? 'active' : ''}`}
                                                        >
                                                            {item}
                                                        </button>
                                                    );
                                                });
                                            })()}
                                        </div>

                                        <button 
                                            onClick={nextPage} 
                                            disabled={currentPage === totalPages}
                                            className='knowledge-pagination-btn'
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}