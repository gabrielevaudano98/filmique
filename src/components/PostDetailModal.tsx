import React from 'react';
import { X } from 'lucide-react';
import { Post } from '../context/AppContext';
import PostView from './PostView';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <PostView post={post} />
        <button onClick={onClose} className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-700 text-white font-semibold p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostDetailModal;