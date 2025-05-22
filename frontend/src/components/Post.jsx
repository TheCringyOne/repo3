import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2, SquareChevronUp, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CustomLink from "./CustomLink";

import PostAction from "./PostAction";

const Post = ({ post }) => {
	const { postId } = useParams();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	
	// Verificar que el post y su autor existen
	if (!post || !post.author) {
		console.warn("Post or author is null/undefined:", post);
		return null; // No renderizar el post si no tiene autor
	}

	const isOwner = authUser._id === post.author._id;
	const isAdmin = authUser.role === 'administrador';
	const isLiked = post.likes.includes(authUser._id);
	
	// Puede eliminar si es el dueño del post O si es administrador
	const canDelete = isOwner || isAdmin;

	const queryClient = useQueryClient();

	const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.delete(`/posts/delete/${post._id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Post eliminado exitosamente");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || error.message);
		},
	});

	const { mutate: createComment, isPending: isAddingComment } = useMutation({
		mutationFn: async (newComment) => {
			await axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Comentario añadido");
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Fallo al añadir el comentario");
		},
	});

	const { mutate: likePost, isPending: isLikingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.post(`/posts/${post._id}/like`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});

	const handleDeletePost = () => {
		let confirmMessage = "¿Estás seguro de que quieres borrar este post?";
		
		// Si es admin pero no es el dueño, mostrar mensaje especial
		if (isAdmin && !isOwner) {
			confirmMessage = `¿Estás seguro de que quieres eliminar este post de ${post.author.name}? Esta acción no se puede deshacer.`;
		}
		
		if (!window.confirm(confirmMessage)) return;
		deletePost();
	};

	const handleLikePost = async () => {
		if (isLikingPost) return;
		likePost();
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (newComment.trim()) {
			createComment(newComment);
			setNewComment("");
			setComments([
				...comments,
				{
					content: newComment,
					user: {
						_id: authUser._id,
						name: authUser.name,
						profilePicture: authUser.profilePicture,
					},
					createdAt: new Date(),
				},
			]);
		}
	};

	return (
		<div className='bg-secondary rounded-lg shadow mb-4'>
			<div className='p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center'>
						<CustomLink to={`/profile/${post.author.username || 'unknown'}`}>
							<img
								src={post.author.profilePicture || "/avatar.png"}
								alt={post.author.name || "Usuario desconocido"}
								className='size-10 rounded-full mr-3'
							/>
						</CustomLink>

						<div>
							<CustomLink to={`/profile/${post.author.username || 'unknown'}`}>
								<h3 className='font-semibold'>{post.author.name || "Usuario desconocido"}</h3>
							</CustomLink>
							<p className='text-xs text-info'>{post.author.headline || "Sin descripción"}</p>
							<p className='text-xs text-info'>
								{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
					{canDelete && (
						<div className="flex items-center">
							{/* Mostrar icono de escudo si es admin eliminando post de otro usuario */}
							{isAdmin && !isOwner && (
								<div className="flex items-center mr-2 text-purple-600" title="Eliminación como administrador">
									<Shield size={16} className="mr-1" />
									<span className="text-xs">Admin</span>
								</div>
							)}
							<button 
								onClick={handleDeletePost} 
								className='text-red-500 hover:text-red-700'
								title={isAdmin && !isOwner ? "Eliminar post como administrador" : "Eliminar tu post"}
							>
								{isDeletingPost ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
							</button>
						</div>
					)}
				</div>
				<p className='mb-4'>{post.content}</p>
				{post.image && <img src={post.image} alt='Post content' className='rounded-lg w-full mb-4' />}

				<div className='flex justify-between text-info'>
					<PostAction
						icon={<SquareChevronUp size={18} className={isLiked ? "text-blue-500  fill-blue-300" : ""} />}
						text={`Votos positivos (${post.likes.length})`}
						onClick={handleLikePost}
					/>
					<PostAction
						icon={<MessageCircle size={18} />}
						text={`Comentarios (${comments.length})`}
						onClick={() => setShowComments(!showComments)}
					/>
				</div>
			</div>

			{showComments && (
				<div className='px-4 pb-4'>
					<div className='mb-4 max-h-60 overflow-y-auto'>
						{comments.map((comment) => (
							<div key={comment._id} className='mb-2 bg-base-100 p-2 rounded flex items-start'>
								<img
									src={comment.user?.profilePicture || "/avatar.png"}
									alt={comment.user?.name || "Usuario"}
									className='w-8 h-8 rounded-full mr-2 flex-shrink-0'
								/>
								<div className='flex-grow'>
									<div className='flex items-center mb-1'>
										<span className='font-semibold mr-2'>{comment.user?.name || "Usuario desconocido"}</span>
										<span className='text-xs text-info'>
											{formatDistanceToNow(new Date(comment.createdAt))}
										</span>
									</div>
									<p>{comment.content}</p>
								</div>
							</div>
						))}
					</div>

					<form onSubmit={handleAddComment} className='flex items-center'>
						<input
							type='text'
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder='Add a comment...'
							className='flex-grow p-2 rounded-l-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
						/>

						<button
							type='submit'
							className='bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300'
							disabled={isAddingComment}
						>
							{isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default Post;
