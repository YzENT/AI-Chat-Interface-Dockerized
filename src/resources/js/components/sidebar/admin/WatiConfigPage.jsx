import { useState, useEffect } from 'react';
import '../../../../css/sidebar/admin/WatiConfigPage.css';
import {toast} from "react-toastify";
import { Heater, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function WatiConfigPage() {

    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    const [newWatiEntry, setNewWatiEntry] = useState({
        api_url: '',
        api_token: '',
        vendor_name: '',
    });
    const [fetchLoading, setFetchLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [watiConfigList, setWatiConfigList] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        getWatiConfigList();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewWatiEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getWatiConfigList = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch('/api/wati/get', {
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

            setWatiConfigList(responseData.data);
        } catch (error) {
            toast.error(error.message);
            setWatiConfigList([]);
        } finally {
            setFetchLoading(false);
        }

    };

    const handleSubmit = async () => {
        if (!newWatiEntry.api_url || !newWatiEntry.api_token || !newWatiEntry.vendor_name) {
            toast.error('Please fill in all the fields!');
            return;
        }

        try {
            setSubmitLoading(true);
            const response = await fetch ('/api/wati/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    api_token: newWatiEntry.api_token,
                    api_url: newWatiEntry.api_url,
                    vendor_name: newWatiEntry.vendor_name,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            toast.success(responseData.msg);
            toggleAddForm();
            getWatiConfigList();
        } catch (error) {
            toast.error(error.message || 'Failed to register new WATI configuration.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (config) => {
        setEditingId(config.id);
        setEditingData(config);
    };

    const handleSaveEdit = async () => {
        if (!editingData.api_url || !editingData.api_token || !editingData.vendor_name) {
            toast.error('Fields cannot be empty.');
            return;
        }

        try {
            setEditLoading(editingId);
            const response = await fetch ('/api/wati/update/' + editingId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    api_token: editingData.api_token,
                    api_url: editingData.api_url,
                    vendor_name: editingData.vendor_name,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            toast.success(responseData.msg);
            setEditingId(null);
            setEditingData({});
            getWatiConfigList();
        } catch (error) {
            toast.error(error.message || 'Failed to update specified WATI config.');
        } finally {
            setEditLoading(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) {
            return;
        }

        try {
            setDeleteLoading(id);
            const response = await fetch ('/api/wati/delete/' + id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            toast.success(responseData.msg);
            getWatiConfigList();
        } catch (error) {
            toast.error(error.message || 'Failed to remove specified WATI configuration.');
        } finally {
            setDeleteLoading(null);
        }
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
        if (!showAddForm) {
            setNewWatiEntry({ api_url: '', api_token: '', vendor_name: '' });
        }
    };

    return (
        <div className='wati-config-page'>
            {/* Header */}
            <div className='wati-config-page-header'>
                <h1 className='wati-config-page-title'>WATI Configuration</h1>
            </div>

            <div className='wati-config-main-page'>
                <div className='wati-config-section'>
                    <div className="wati-config-section-header">
                        <h2 className='wati-config-section-title'>WATI Configuration</h2>
                        <button 
                            className="wati-add-config-btn"
                            onClick={toggleAddForm}
                        >
                            <Plus size={16} />
                            Add Configuration
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="wati-add-form-container">
                            <div className="wati-add-form">
                                <div className="wati-form-row">
                                    <div className="wati-form-group">
                                        <label>API URL</label>
                                        <input
                                            type="text"
                                            name="api_url"
                                            value={newWatiEntry.api_url}
                                            onChange={handleInputChange}
                                            placeholder="Enter API URL"
                                            className="wati-form-input"
                                        />
                                    </div>
                                    <div className="wati-form-group">
                                        <label>API Token</label>
                                        <input
                                            type="text"
                                            name="api_token"
                                            value={newWatiEntry.api_token}
                                            onChange={handleInputChange}
                                            placeholder="Enter API Token"
                                            className="wati-form-input"
                                        />
                                    </div>
                                    <div className="wati-form-group">
                                        <label>Vendor Name</label>
                                        <input
                                            type="text"
                                            name="vendor_name"
                                            value={newWatiEntry.vendor_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter Vendor Name"
                                            className="wati-form-input"
                                        />
                                    </div>
                                </div>
                                <div className="wati-form-actions">
                                    <button 
                                        className="wati-submit-btn"
                                        disabled={submitLoading}
                                        onClick={handleSubmit}
                                    >
                                        {submitLoading ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            <span>Adding...</span>
                                        </>
                                            
                                        ) : 'Add Configuration'}
                                    </button>
                                    <button 
                                        className="wati-cancel-btn"
                                        onClick={toggleAddForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='wati-config-wrapper'>
                        {fetchLoading ? (
                            <div className="wati-config-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading WATI Configuration</p>
                            </div>
                        ) : watiConfigList.length === 0 ? (
                            <div className="wati-config-empty">
                                <Heater size={48} className="text-gray-500" />
                                <p>No configuration found.</p>
                            </div>
                        ) : (
                            <div className="wati-config-table">
                                <div className="wati-table-header">
                                    <div className="wati-header-cell">API URL</div>
                                    <div className="wati-header-cell">API Token</div>
                                    <div className="wati-header-cell">Vendor Name</div>
                                    <div className="wati-header-cell wati-actions-header">Actions</div>
                                </div>
                                
                                {watiConfigList.map(config => (
                                    <div key={config.id} className="wati-table-row">
                                        {editingId === config.id ? (
                                            <>
                                                <div className="wati-table-cell">
                                                    <input
                                                        type="text"
                                                        name="api_url"
                                                        value={editingData.api_url}
                                                        onChange={handleEditInputChange}
                                                        className="wati-edit-input"
                                                    />
                                                </div>
                                                <div className="wati-table-cell">
                                                    <input
                                                        type="text"
                                                        name="api_token"
                                                        value={editingData.api_token}
                                                        onChange={handleEditInputChange}
                                                        className="wati-edit-input"
                                                    />
                                                </div>
                                                <div className="wati-table-cell">
                                                    <input
                                                        type="text"
                                                        name="vendor_name"
                                                        value={editingData.vendor_name}
                                                        onChange={handleEditInputChange}
                                                        className="wati-edit-input"
                                                    />
                                                </div>
                                                <div className="wati-table-cell wati-actions-cell">
                                                    <button 
                                                        className="wati-action-btn wati-save-btn"
                                                        onClick={handleSaveEdit}
                                                        title="Save"
                                                        disabled={editLoading === config.id}
                                                    >
                                                        
                                                        {editLoading === config.id ? <div className="loading-spinner"></div> : <Save size={16} />}

                                                    </button>
                                                    <button 
                                                        className="wati-action-btn wati-cancel-btn-icon"
                                                        onClick={handleCancelEdit}
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="wati-table-cell" title={config.api_url}>
                                                    {config.api_url}
                                                </div>
                                                <div className="wati-table-cell wati-token-cell" title={config.api_token}>
                                                    {config.api_token}
                                                </div>
                                                <div className="wati-table-cell" title={config.vendor_name}>
                                                    {config.vendor_name}
                                                </div>
                                                <div className="wati-table-cell wati-actions-cell">
                                                    <button 
                                                        className="wati-action-btn wati-edit-btn"
                                                        onClick={() => handleEdit(config)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        className="wati-action-btn wati-delete-btn"
                                                        onClick={() => handleDelete(config.id)}
                                                        title="Delete"
                                                        disabled={deleteLoading === config.id}
                                                    >
                                                        {deleteLoading === config.id ? <div className="loading-spinner"></div> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}