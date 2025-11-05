import json
import logging
from typing import Dict, Any
from src.utils.analysis import analyze_images
from src.utils.response import success_response, error_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda handler for OCR service"""
    try:
        logger.info(f'Received event: {json.dumps(event)}')
        
        # Handle health check - check multiple path formats
        path = event.get('rawPath') or event.get('path', '')
        if path == '/health' or event.get('httpMethod') == 'GET':
            return success_response({
                'status': 'ok',
                'service': 'ocr',
                'version': '1.0.0'
            })
        
        # Parse request body
        body_str = event.get('body', '{}')
        if isinstance(body_str, str):
            body = json.loads(body_str)
        else:
            body = body_str
            
        images_base64 = body.get('images', [])
        
        if not images_base64:
            return error_response('No images provided', 400)
        
        if not isinstance(images_base64, list):
            return error_response('Images must be an array', 400)
        
        # Analyze images
        logger.info(f'Analyzing {len(images_base64)} images')
        result = analyze_images(images_base64)
        
        if not result.get('success'):
            return error_response(
                result.get('error', 'Analysis failed'),
                500
            )
        
        return success_response(result)
        
    except json.JSONDecodeError:
        logger.error('Invalid JSON in request body')
        return error_response('Invalid JSON', 400)
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}', exc_info=True)
        return error_response('Internal server error', 500)