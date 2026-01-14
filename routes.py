from flask import send_from_directory, render_template_string, request, jsonify
import os
import re
import requests
import base64
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin, urlparse
from datetime import datetime
from werkzeug.utils import secure_filename

from app import app, db
from models import WhatsAppGroup

logger = logging.getLogger(__name__)

# HTML template for group pages
GROUP_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ group_title }} - WhatsApp Group Hub</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp Group Hub</span>
        </div>
        <button class="nav-toggle">
            <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/pages/about.html">About</a></li>
            <li><a href="/pages/contact.html">Contact</a></li>
            <li><a href="/pages/privacy.html">Privacy</a></li>
            <li><a href="/pages/terms.html">Terms</a></li>
        </ul>
    </nav>

    <main class="container group-detail-page">
        <div class="group-header">
            <div class="group-info">
                <h1>{{ group_title }}</h1>
                <div class="group-meta">
                    <span class="category-badge">{{ category }}</span>
                    <span class="country-badge">{{ country }}</span>
                </div>
            </div>
        </div>

        <section class="group-content">
            <div class="group-join-card">
                {{ group_card | safe }}
            </div>

            <div class="group-article">
                <h2>About WhatsApp Groups</h2>

                <h3>What is WhatsApp?</h3>
                <p>WhatsApp is a popular messaging app that allows users to send messages, make voice and video calls, and share media with friends and family worldwide. It's used by over 2 billion people globally and is known for its end-to-end encryption and user-friendly interface.</p>

                <h3>What are WhatsApp Groups?</h3>
                <p>WhatsApp groups are communities within the WhatsApp platform where multiple users can interact together. They serve as virtual meeting spaces where people with common interests can share messages, media, and engage in discussions.</p>

                <h3>Uses of WhatsApp Groups</h3>
                <ul>
                    <li>Connecting with like-minded people in the {{ category }} community</li>
                    <li>Sharing updates and news related to {{ category }}</li>
                    <li>Organizing events and meetups</li>
                    <li>Learning from experts and enthusiasts</li>
                    <li>Networking with people from {{ country }}</li>
                </ul>

                <h3>Advantages of WhatsApp Groups</h3>
                <ul>
                    <li>Free and easy communication with multiple people simultaneously</li>
                    <li>Share photos, videos, and documents instantly</li>
                    <li>Create focused communities around specific interests</li>
                    <li>Stay updated with real-time notifications</li>
                    <li>End-to-end encryption for secure communications</li>
                </ul>

                <h3>Why Join This Group?</h3>
                <p>This {{ category }} group in {{ country }} offers a unique opportunity to connect with others who share your interests. You'll be able to participate in discussions, share knowledge, and stay updated with the latest developments in this field.</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>WhatsApp Group Hub</h3>
                <p>Share and discover amazing WhatsApp groups</p>
            </div>
            <div class="footer-links">
                <a href="/pages/about.html">About</a>
                <a href="/pages/privacy.html">Privacy Policy</a>
                <a href="/pages/terms.html">Terms</a>
                <a href="/pages/contact.html">Contact</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 WhatsApp Group Hub. All rights reserved.</p>
        </div>
    </footer>

    <script>
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');

        navToggle?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    </script>
</body>
</html>
'''

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/extract-group-image', methods=['POST'])
def extract_group_image():
    """
    Enhanced WhatsApp group image extraction endpoint
    This endpoint scrapes WhatsApp group pages to extract actual group images
    """
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        if not url.startswith('https://chat.whatsapp.com/'):
            return jsonify({'error': 'Invalid WhatsApp group URL'}), 400
            
        logger.info(f"Extracting image from WhatsApp URL: {url}")
        
        # Set up headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Fetch the WhatsApp group page
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract group information
        group_image = None
        group_title = None
        group_description = None
        
        # Method 1: Look for Open Graph meta tags (most reliable)
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            group_image = og_image.get('content')
            # Ensure we get the full URL with all query parameters
            if group_image and not str(group_image).startswith('http'):
                group_image = urljoin(url, str(group_image))
            logger.info(f"Found OG image: {group_image}")
            
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            group_title = og_title.get('content')
            
        og_description = soup.find('meta', property='og:description')
        if og_description and og_description.get('content'):
            group_description = og_description.get('content')
        
        # Method 2: Look for Twitter Card meta tags as fallback
        if not group_image:
            twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
            if twitter_image and twitter_image.get('content'):
                group_image = twitter_image.get('content')
                logger.info(f"Found Twitter image: {group_image}")
        
        # Method 3: Look for WhatsApp-specific image containers
        if not group_image:
            # Look for images in typical WhatsApp group page structure
            whatsapp_images = soup.find_all('img', src=True)
            for img in whatsapp_images:
                src = img.get('src')
                if src:
                    # Look for WhatsApp profile/group images (usually contain specific patterns)
                    if any(pattern in str(src).lower() for pattern in ['profile', 'group', 'avatar', 'photo']):
                        if str(src).startswith('http'):
                            group_image = str(src)
                            logger.info(f"Found WhatsApp-specific image: {group_image}")
                            break
                        elif str(src).startswith('/'):
                            group_image = urljoin(url, str(src))
                            logger.info(f"Found relative WhatsApp image: {group_image}")
                            break
        
        # Method 4: Use fallback API if direct scraping doesn't work
        if not group_image:
            logger.info("Trying fallback with Microlink API")
            try:
                microlink_url = f"https://api.microlink.io/?url={url}"
                microlink_response = requests.get(microlink_url, timeout=10)
                microlink_data = microlink_response.json()
                
                if microlink_data.get('status') == 'success':
                    data = microlink_data.get('data', {})
                    if data.get('image', {}).get('url'):
                        group_image = data['image']['url']
                        logger.info(f"Found image via Microlink: {group_image}")
                    
                    # Also update title and description if not found
                    if not group_title and data.get('title'):
                        group_title = data['title']
                    if not group_description and data.get('description'):
                        group_description = data['description']
                        
            except Exception as e:
                logger.warning(f"Microlink fallback failed: {e}")
        
        # Ensure we have a complete image URL with all query parameters preserved
        if group_image and isinstance(group_image, str):
            # Make sure URL is absolute
            if not group_image.startswith('http'):
                group_image = urljoin(url, group_image)
            
            # For WhatsApp images, preserve ALL query parameters as they're essential
            if 'pps.whatsapp.net' in group_image or 'static.whatsapp.net' in group_image:
                logger.info(f"WhatsApp CDN image found, preserving complete URL: {group_image}")
                # WhatsApp CDN URLs are valid, don't test them due to CORS
            else:
                # Test non-WhatsApp images for accessibility
                try:
                    img_response = requests.head(group_image, timeout=5)
                    if img_response.status_code != 200:
                        logger.warning(f"External image not accessible: {group_image}")
                        group_image = "https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png"
                except Exception as e:
                    logger.warning(f"Could not verify external image: {e}")
                    group_image = "https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png"
        
        # Final fallback if no image found
        if not group_image:
            group_image = "https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png"
            logger.info("Using WhatsApp default image")
        
        result = {
            'success': True,
            'image': group_image,
            'title': group_title or 'WhatsApp Group',
            'description': group_description or 'Join this WhatsApp group',
            'url': url
        }
        
        logger.info(f"Successfully extracted: {result}")
        return jsonify(result)
        
    except requests.RequestException as e:
        logger.error(f"Request error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch WhatsApp group page',
            'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred',
            'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'
        }), 500

def extract_group_metadata(url):
    """Extract WhatsApp group metadata using web scraping"""
    try:
        logger.info(f"Extracting metadata from URL: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract OG image
        og_image = soup.find('meta', property='og:image')
        image_url = og_image.get('content') if og_image else None
        
        # Extract title
        og_title = soup.find('meta', property='og:title')
        title = og_title.get('content') if og_title else 'WhatsApp Group'
        
        # Extract description
        og_desc = soup.find('meta', property='og:description')
        description = og_desc.get('content') if og_desc else 'Join this WhatsApp group'
        
        # Fallback image if none found
        if not image_url:
            image_url = "https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png"
        
        return {
            'title': title,
            'description': description,
            'image_url': image_url
        }
        
    except Exception as e:
        logger.error(f"Error extracting metadata: {e}")
        return {
            'title': 'WhatsApp Group',
            'description': 'Join this WhatsApp group',
            'image_url': "https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png"
        }

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """Get all WhatsApp groups from database with cache prevention"""
    try:
        groups = WhatsAppGroup.query.filter_by(is_active=True).order_by(WhatsAppGroup.created_at.desc()).limit(500).all()
        groups_data = [group.to_dict() for group in groups]
        
        response = jsonify({
            'success': True,
            'groups': groups_data,
            'count': len(groups_data),
            'timestamp': datetime.now().isoformat(),
            'cache_buster': request.args.get('cb', 'none')
        })
        
        # Add aggressive cache prevention headers
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['Last-Modified'] = datetime.now().strftime('%a, %d %b %Y %H:%M:%S GMT')
        response.headers['ETag'] = f'"groups-{datetime.now().timestamp()}-{len(groups_data)}"'
        
        return response
    except Exception as e:
        logger.error(f"Error getting groups: {e}")
        return jsonify({
            'success': False,
            'groups': [],
            'count': 0,
            'error': str(e)
        })

@app.route('/api/groups', methods=['POST'])
def add_group():
    """Add a new WhatsApp group"""
    try:
        data = request.get_json()
        
        if not data or not data.get('group_url'):
            return jsonify({'error': 'Group URL is required'}), 400
        
        url = data.get('group_url').strip()
        
        if not url.startswith('https://chat.whatsapp.com/'):
            return jsonify({'error': 'Invalid WhatsApp group URL'}), 400
        
        # Check if group already exists
        existing_group = WhatsAppGroup.query.filter_by(group_url=url).first()
        if existing_group:
            return jsonify({'error': 'Group already exists'}), 409
        
        # Extract metadata
        metadata = extract_group_metadata(url)
        
        # Create new group
        new_group = WhatsAppGroup()
        new_group.title = data.get('title') or metadata['title']
        new_group.description = data.get('description') or metadata['description']
        new_group.group_url = url
        new_group.image_url = data.get('image_url') or metadata['image_url']
        new_group.category = data.get('category', 'General')
        new_group.country = data.get('country', 'Global')
        new_group.member_count = data.get('member_count', 0)
        
        db.session.add(new_group)
        db.session.commit()
        
        return jsonify(new_group.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding group: {e}")
        return jsonify({'error': 'Failed to add group'}), 500

@app.route('/group/<path:group_title>')
def group_detail(group_title):
    """Generate dynamic group detail page"""
    try:
        # Decode the group title from URL
        decoded_title = group_title.replace('-', ' ').title()
        
        # Find the group in database
        group = WhatsAppGroup.query.filter(
            WhatsAppGroup.title.ilike(f'%{decoded_title}%')
        ).first()
        
        if not group:
            # Create a fallback group card
            group_card = f'''
            <div class="group-card">
                <div class="group-image">
                    <img src="https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png" alt="{decoded_title}">
                </div>
                <div class="group-content">
                    <h3>{decoded_title}</h3>
                    <p>Join this WhatsApp group to connect with others.</p>
                    <div class="group-meta">
                        <span class="category">General</span>
                        <span class="country">Global</span>
                    </div>
                    <a href="#" class="join-btn" onclick="alert('Group link not available')">
                        <i class="fab fa-whatsapp"></i> Join Group
                    </a>
                </div>
            </div>
            '''
            category = 'General'
            country = 'Global'
        else:
            # Create group card from database
            group_card = f'''
            <div class="group-card">
                <div class="group-image">
                    <img src="{group.image_url or 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png'}" alt="{group.title}">
                </div>
                <div class="group-content">
                    <h3>{group.title}</h3>
                    <p>{group.description or 'Join this WhatsApp group to connect with others.'}</p>
                    <div class="group-meta">
                        <span class="category">{group.category}</span>
                        <span class="country">{group.country}</span>
                        <span class="members">{group.member_count} members</span>
                    </div>
                    <a href="{group.group_url}" class="join-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp"></i> Join Group
                    </a>
                </div>
            </div>
            '''
            category = group.category
            country = group.country
        
        # Render the template
        return render_template_string(GROUP_TEMPLATE, 
                                    group_title=decoded_title,
                                    group_card=group_card,
                                    category=category,
                                    country=country)
        
    except Exception as e:
        logger.error(f"Error generating group detail page: {e}")
        return send_from_directory('.', '404.html'), 404

# Catch-all route for other paths
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files and handle routing"""
    try:
        # First try to serve as static file
        return send_from_directory('.', path)
    except:
        # If file doesn't exist, return 404
        return send_from_directory('.', '404.html'), 404