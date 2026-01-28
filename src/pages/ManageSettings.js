import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  Edit2, 
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MoveUp,
  MoveDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import settingsService from '../services/settingsService';
import './ManageSettings.css';

const ManageSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('scrolling');

  // Scrolling Text States
  const [newScrollText, setNewScrollText] = useState('');
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');

  // Hero Images State
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Single Images States
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState(null);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  const [chairmanImageFile, setChairmanImageFile] = useState(null);
  const [chairmanImagePreview, setChairmanImagePreview] = useState(null);
  const [uploadingChairman, setUploadingChairman] = useState(false);

  const [noticeImageFile, setNoticeImageFile] = useState(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState(null);
  const [uploadingNotice, setUploadingNotice] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SCROLLING TEXT FUNCTIONS
  // ============================================
  const handleAddScrollingText = async () => {
    if (!newScrollText.trim()) {
      toast.error('Please enter text');
      return;
    }

    try {
      await settingsService.addScrollingText({ text: newScrollText });
      toast.success('Scrolling text added');
      setNewScrollText('');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to add text');
    }
  };

  const handleUpdateScrollingText = async (textId) => {
    if (!editingTextValue.trim()) {
      toast.error('Please enter text');
      return;
    }

    try {
      await settingsService.updateScrollingText(textId, { text: editingTextValue });
      toast.success('Text updated');
      setEditingTextId(null);
      setEditingTextValue('');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to update text');
    }
  };

  const handleDeleteScrollingText = async (textId) => {
    if (!window.confirm('Delete this scrolling text?')) return;

    try {
      await settingsService.deleteScrollingText(textId);
      toast.success('Text deleted');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete text');
    }
  };

  const handleToggleScrollingText = async (textId, currentStatus) => {
    try {
      await settingsService.updateScrollingText(textId, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Text deactivated' : 'Text activated');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle text');
    }
  };

  // ============================================
  // HERO IMAGES FUNCTIONS
  // ============================================
  const handleHeroImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadHeroImage = async () => {
    if (!heroImageFile) {
      toast.error('Please select an image');
      return;
    }

    if (settings?.heroImages?.length >= 10) {
      toast.error('Maximum 10 hero images allowed');
      return;
    }

    try {
      setUploadingHero(true);
      const formData = new FormData();
      formData.append('image', heroImageFile);

      await settingsService.addHeroImage(formData);
      toast.success('Hero image added');
      
      setHeroImageFile(null);
      setHeroImagePreview(null);
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleDeleteHeroImage = async (imageId) => {
    if (!window.confirm('Delete this hero image?')) return;

    try {
      await settingsService.deleteHeroImage(imageId);
      toast.success('Hero image deleted');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // ============================================
  // ABOUT IMAGE FUNCTIONS
  // ============================================
  const handleAboutImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAboutImage = async () => {
    if (!aboutImageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploadingAbout(true);
      const formData = new FormData();
      formData.append('image', aboutImageFile);

      await settingsService.updateAboutImage(formData);
      toast.success('About image updated');
      
      setAboutImageFile(null);
      setAboutImagePreview(null);
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingAbout(false);
    }
  };

  const handleDeleteAboutImage = async () => {
    if (!window.confirm('Delete about image?')) return;

    try {
      await settingsService.deleteAboutImage();
      toast.success('About image deleted');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // ============================================
  // CHAIRMAN IMAGE FUNCTIONS
  // ============================================
  const handleChairmanImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChairmanImageFile(file);
      setChairmanImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadChairmanImage = async () => {
    if (!chairmanImageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploadingChairman(true);
      const formData = new FormData();
      formData.append('image', chairmanImageFile);

      await settingsService.updateChairmanImage(formData);
      toast.success('Chairman image updated');
      
      setChairmanImageFile(null);
      setChairmanImagePreview(null);
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingChairman(false);
    }
  };

  const handleDeleteChairmanImage = async () => {
    if (!window.confirm('Delete chairman image?')) return;

    try {
      await settingsService.deleteChairmanImage();
      toast.success('Chairman image deleted');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // ============================================
  // NOTICE IMAGE FUNCTIONS
  // ============================================
  const handleNoticeImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNoticeImageFile(file);
      setNoticeImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadNoticeImage = async () => {
    if (!noticeImageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploadingNotice(true);
      const formData = new FormData();
      formData.append('image', noticeImageFile);

      await settingsService.updateNoticeImage(formData);
      toast.success('Notice image updated');
      
      setNoticeImageFile(null);
      setNoticeImagePreview(null);
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingNotice(false);
    }
  };

  const handleDeleteNoticeImage = async () => {
    if (!window.confirm('Delete notice image?')) return;

    try {
      await settingsService.deleteNoticeImage();
      toast.success('Notice image deleted');
      fetchSettings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="manage-settings-page">
      <div className="page-header">
        <div className="header-left">
          <Settings size={32} />
          <div>
            <h1>Manage Website Settings</h1>
            <p>Control scrolling text, hero images, and other images</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'scrolling' ? 'active' : ''}`}
          onClick={() => setActiveTab('scrolling')}
        >
          Scrolling Text
        </button>
        <button 
          className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Hero Images
        </button>
        <button 
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Image
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chairman' ? 'active' : ''}`}
          onClick={() => setActiveTab('chairman')}
        >
          Chairman Image
        </button>
        {/* <button 
          className={`tab-btn ${activeTab === 'notice' ? 'active' : ''}`}
          onClick={() => setActiveTab('notice')}
        >
          Notice Image
        </button> */}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* SCROLLING TEXT TAB */}
        {activeTab === 'scrolling' && (
          <div className="settings-section">
            <h2>Manage Scrolling Text</h2>
            <p className="section-description">
              Add and manage scrolling announcement texts that appear on the home page header.
            </p>

            {/* Add New Text */}
            <div className="add-text-form">
              <input
                type="text"
                placeholder="Enter new scrolling text..."
                value={newScrollText}
                onChange={(e) => setNewScrollText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddScrollingText()}
              />
              <button onClick={handleAddScrollingText} className="btn-primary">
                <Plus size={20} /> Add Text
              </button>
            </div>

            {/* List of Scrolling Texts */}
            <div className="scrolling-texts-list">
              {settings?.scrollingTexts?.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <p>No scrolling texts added yet</p>
                </div>
              ) : (
                settings?.scrollingTexts?.map((item) => (
                  <div key={item._id} className="scrolling-text-item">
                    {editingTextId === item._id ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          value={editingTextValue}
                          onChange={(e) => setEditingTextValue(e.target.value)}
                          autoFocus
                        />
                        <button 
                          onClick={() => handleUpdateScrollingText(item._id)}
                          className="btn-save"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingTextId(null);
                            setEditingTextValue('');
                          }}
                          className="btn-cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-content">
                          <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <p>{item.text}</p>
                        </div>
                        <div className="text-actions">
                          <button
                            onClick={() => handleToggleScrollingText(item._id, item.isActive)}
                            className="btn-toggle"
                            title={item.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {item.isActive ? '🟢' : '🔴'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingTextId(item._id);
                              setEditingTextValue(item.text);
                            }}
                            className="btn-edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteScrollingText(item._id)}
                            className="btn-delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* HERO IMAGES TAB */}
        {activeTab === 'hero' && (
          <div className="settings-section">
            <h2>Manage Hero Images</h2>
            <p className="section-description">
              Upload up to 10 hero images for the home page carousel. (Maximum: 10 images)
            </p>

            {/* Upload New Hero Image */}
            <div className="upload-section">
              <div className="upload-box">
                <input
                  type="file"
                  id="hero-image-input"
                  accept="image/*"
                  onChange={handleHeroImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="hero-image-input" className="upload-label">
                  {heroImagePreview ? (
                    <img src={heroImagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>Click to upload hero image</p>
                      <span>Recommended: 1920x600px</span>
                    </div>
                  )}
                </label>
              </div>

              {heroImageFile && (
                <div className="upload-actions">
                  <button 
                    onClick={handleUploadHeroImage} 
                    disabled={uploadingHero}
                    className="btn-primary"
                  >
                    {uploadingHero ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button 
                    onClick={() => {
                      setHeroImageFile(null);
                      setHeroImagePreview(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Current Hero Images */}
            <div className="hero-images-grid">
              <div className="grid-header">
                <h3>Current Hero Images ({settings?.heroImages?.length || 0}/10)</h3>
              </div>

              {settings?.heroImages?.length === 0 ? (
                <div className="empty-state">
                  <ImageIcon size={48} />
                  <p>No hero images uploaded yet</p>
                </div>
              ) : (
                <div className="images-grid">
                  {settings?.heroImages
                    ?.sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                      <div key={image._id} className="image-card">
                        <img src={image.url} alt={`Hero ${index + 1}`} />
                        <div className="image-overlay">
                          <span className="image-order">#{image.order}</span>
                          <button
                            onClick={() => handleDeleteHeroImage(image._id)}
                            className="btn-delete-image"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT IMAGE TAB */}
        {activeTab === 'about' && (
          <div className="settings-section">
            <h2>About Section Image</h2>
            <p className="section-description">
              Upload or update the image displayed in the About section.
            </p>

            {/* Current About Image */}
            {settings?.aboutImage?.url && (
              <div className="current-image-display">
                <h3>Current Image</h3>
                <div className="image-preview-large">
                  <img src={settings.aboutImage.url} alt="About" />
                  <button 
                    onClick={handleDeleteAboutImage}
                    className="btn-delete-overlay"
                  >
                    <Trash2 size={20} /> Delete Image
                  </button>
                </div>
              </div>
            )}

            {/* Upload New About Image */}
            <div className="upload-section">
              <div className="upload-box">
                <input
                  type="file"
                  id="about-image-input"
                  accept="image/*"
                  onChange={handleAboutImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="about-image-input" className="upload-label">
                  {aboutImagePreview ? (
                    <img src={aboutImagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>Click to upload new about image</p>
                      <span>Recommended: 800x600px</span>
                    </div>
                  )}
                </label>
              </div>

              {aboutImageFile && (
                <div className="upload-actions">
                  <button 
                    onClick={handleUploadAboutImage} 
                    disabled={uploadingAbout}
                    className="btn-primary"
                  >
                    {uploadingAbout ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button 
                    onClick={() => {
                      setAboutImageFile(null);
                      setAboutImagePreview(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHAIRMAN IMAGE TAB */}
        {activeTab === 'chairman' && (
          <div className="settings-section">
            <h2>Chairman/Principal Image</h2>
            <p className="section-description">
              Upload or update the chairman/principal image.
            </p>

            {/* Current Chairman Image */}
            {settings?.chairmanImage?.url && (
              <div className="current-image-display">
                <h3>Current Image</h3>
                <div className="image-preview-large">
                  <img src={settings.chairmanImage.url} alt="Chairman" />
                  <button 
                    onClick={handleDeleteChairmanImage}
                    className="btn-delete-overlay"
                  >
                    <Trash2 size={20} /> Delete Image
                  </button>
                </div>
              </div>
            )}

            {/* Upload New Chairman Image */}
            <div className="upload-section">
              <div className="upload-box">
                <input
                  type="file"
                  id="chairman-image-input"
                  accept="image/*"
                  onChange={handleChairmanImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="chairman-image-input" className="upload-label">
                  {chairmanImagePreview ? (
                    <img src={chairmanImagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>Click to upload chairman image</p>
                      <span>Recommended: 400x400px (Square)</span>
                    </div>
                  )}
                </label>
              </div>

              {chairmanImageFile && (
                <div className="upload-actions">
                  <button 
                    onClick={handleUploadChairmanImage} 
                    disabled={uploadingChairman}
                    className="btn-primary"
                  >
                    {uploadingChairman ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button 
                    onClick={() => {
                      setChairmanImageFile(null);
                      setChairmanImagePreview(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTICE IMAGE TAB */}
        {activeTab === 'notice' && (
          <div className="settings-section">
            <h2>Notice Section Side Image</h2>
            <p className="section-description">
              Upload or update the image displayed beside the notice board.
            </p>

            {/* Current Notice Image */}
            {settings?.noticeImage?.url && (
              <div className="current-image-display">
                <h3>Current Image</h3>
                <div className="image-preview-large">
                  <img src={settings.noticeImage.url} alt="Notice" />
                  <button 
                    onClick={handleDeleteNoticeImage}
                    className="btn-delete-overlay"
                  >
                    <Trash2 size={20} /> Delete Image
                  </button>
                </div>
              </div>
            )}

            {/* Upload New Notice Image */}
            <div className="upload-section">
              <div className="upload-box">
                <input
                  type="file"
                  id="notice-image-input"
                  accept="image/*"
                  onChange={handleNoticeImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="notice-image-input" className="upload-label">
                  {noticeImagePreview ? (
                    <img src={noticeImagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>Click to upload notice image</p>
                      <span>Recommended: 800x450px (16:9 ratio)</span>
                    </div>
                  )}
                </label>
              </div>

              {noticeImageFile && (
                <div className="upload-actions">
                  <button 
                    onClick={handleUploadNoticeImage} 
                    disabled={uploadingNotice}
                    className="btn-primary"
                  >
                    {uploadingNotice ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button 
                    onClick={() => {
                      setNoticeImageFile(null);
                      setNoticeImagePreview(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSettings;