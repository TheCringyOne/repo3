import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users, Newspaper, FileText } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";

const HomePage = () => {
	const { data: authUser, isLoading: isAuthLoading } = useQuery({ 
		queryKey: ["authUser"],
		retry: false
	});

	const { data: recommendedUsers, isLoading: isRecommendedLoading } = useQuery({
		queryKey: ["recommendedUsers"],
		queryFn: async () => {
			const res = await axiosInstance.get("/users/suggestions?limit=5");
			return res.data;
		},
		enabled: !!authUser, // Solo ejecutar si authUser existe
	});

	const { data: posts, isLoading: isPostsLoading } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await axiosInstance.get("/posts");
			return res.data;
		},
		enabled: !!authUser, // Solo ejecutar si authUser existe
	});

	// Si está cargando, mostrar un spinner
	if (isAuthLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Si no hay usuario autenticado, mostrar un mensaje
	if (!authUser) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Por favor inicia sesión para ver el contenido</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={authUser} />
			</div>

			<div className='col-span-1 lg:col-span-2 order-first lg:order-none'>
				<PostCreation user={authUser} />

				{isPostsLoading ? (
					<div className="flex justify-center py-6">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : (
					<>
						{posts && posts.length > 0 ? (
							posts.map((post) => (
								<Post key={post._id} post={post} />
							))
						) : (
							<div className='bg-white rounded-lg shadow p-8 text-center'>
								<div className='mb-6'>
									<FileText size={64} className='mx-auto text-blue-500' />
								</div>
								<h2 className='text-2xl font-bold mb-4 text-gray-800'>No hay publicaciones todavía</h2>
								<p className='text-gray-600 mb-6'>Añade personas a tus contactos para poder ver sus posts</p>
							</div>
						)}
					</>
				)}
			</div>

			{recommendedUsers && recommendedUsers.length > 0 && (
				<div className='col-span-1 lg:col-span-1 hidden lg:block'>
					<div className='bg-secondary rounded-lg shadow p-4'>
						<h2 className='font-semibold mb-4'>Personas que quiza conozcas</h2>
						{recommendedUsers.map((user) => (
							<RecommendedUser key={user._id} user={user} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};
export default HomePage;
