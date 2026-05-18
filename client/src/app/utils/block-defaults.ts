import { BlockType, BlockProps } from '../store/builder.models';

export function getDefaultProps(type: BlockType): BlockProps {
  switch (type) {
    case 'text':
      return {
        content: 'Edit this text...',
        fontSize: '16px',
        color: '#111827',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '8px',
        lineHeight: '1.6'
      };
    case 'heading':
      return {
        content: 'Your Heading Here',
        level: 'h2',
        fontSize: '32px',
        color: '#111827',
        fontWeight: 'bold',
        textAlign: 'left',
        padding: '8px'
      };
    case 'image':
      return {
        src: 'https://placehold.co/800x400',
        alt: 'Image description',
        width: '100%',
        height: 'auto',
        borderRadius: '0px',
        objectFit: 'cover'
      };
    case 'button':
      return {
        label: 'Click Me',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: '16px',
        padding: '12px 24px',
        borderRadius: '8px',
        href: '#',
        target: '_self',
        fontWeight: '600'
      };
    case 'section':
      return {
        backgroundColor: '#f9fafb',
        padding: '40px 20px',
        minHeight: '200px',
        width: '100%'
      };
    case 'divider':
      return {
        thickness: '1px',
        color: '#e5e7eb',
        margin: '20px 0',
        width: '100%'
      };
    case 'spacer':
      return {
        height: '40px',
        width: '100%'
      };
    case 'video':
      return {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: '100%',
        height: '400px',
        borderRadius: '8px'
      };
    case 'columns':
      return {
        columns: 2,
        gap: '20px',
        margin: '20px 0',
        width: '100%',
        minHeight: '100px'
      };
    case 'card':
      return {
        src: 'https://placehold.co/400x200',
        cardTitle: 'Card Title',
        cardText: 'This is a description inside the card.',
        cardButtonText: 'Learn More',
        padding: '20px',
        backgroundColor: '#ffffff',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px'
      };
    case 'form':
      return {
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      };
    case 'input':
      return {
        placeholder: 'Enter text...',
        inputType: 'text',
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        color: '#111827',
        backgroundColor: '#ffffff',
        margin: '12px 0'
      };
    case 'icon':
      return {
        iconName: 'star',
        iconSize: 24,
        color: '#3b82f6',
        textAlign: 'center',
        padding: '10px'
      };
    case 'html':
      return {
        htmlContent: '<div class="p-4 bg-gray-100 rounded text-gray-800">Custom HTML content</div>',
        width: '100%'
      };
    case 'map':
      return {
        address: 'New York, NY',
        zoom: 12,
        width: '100%',
        height: '300px',
        borderRadius: '8px'
      };
    default:
      return {};
  }
}
