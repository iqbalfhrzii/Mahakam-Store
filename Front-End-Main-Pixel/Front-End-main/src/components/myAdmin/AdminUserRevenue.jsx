import React, { useEffect, useState } from "react";
import {
	collection,
	getDocs,
	doc,
	getDoc,
	getFirestore,
	updateDoc,
} from "firebase/firestore";
import HeaderSidebar from "../headerNavBreadcrumbs/HeaderSidebar";
import NavigationItem from "../sidebarDashboardAdmin/navigationItemsAdmin";
import Breadcrumbs from "../breadcrumbs/Breadcrumbs";

function AdminUserRevenue() {
	const db = getFirestore();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [revenues, setRevenues] = useState([]);
	const [totalRevenue, setTotalRevenue] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dropdownOpen, setDropdownOpen] = useState({});
	const [accountDetails, setAccountDetails] = useState({});

	const toggleDropdown = async (userId) => {
		setDropdownOpen((prev) => ({ ...prev, [userId]: !prev[userId] }));
		if (!dropdownOpen[userId]) {
			const accountData = await fetchAccountDetails(userId);
			setAccountDetails((prev) => ({ ...prev, [userId]: accountData || {} }));
		}
	};

	useEffect(() => {
		const fetchRevenues = async () => {
			try {
				const revenueSnapshot = await getDocs(collection(db, "revenue"));
				const revenueData = revenueSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setRevenues(revenueData);

				const total = revenueData.reduce((sum, revenue) => {
					return sum + (revenue.totalPendapatan || 0);
				}, 0);
				setTotalRevenue(total);
			} catch (error) {
				setError("Error fetching revenue data: " + error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRevenues();
	}, [db]);

	const fetchAccountDetails = async (userId) => {
		const accountDocRef = doc(db, "aturBayaran", userId);
		const accountDoc = await getDoc(accountDocRef);
		if (accountDoc.exists()) {
			return accountDoc.data();
		} else {
			console.log("Tidak ada data rekening untuk userId:", userId);
			return null;
		}
	};

	const handleWithdraw = async (userId, amount) => {
		try {
			const accountDocRef = doc(db, "revenue", userId);
			const accountDoc = await getDoc(accountDocRef);

			if (accountDoc.exists()) {
				const currentData = accountDoc.data();
				const newTotal = currentData.totalPendapatan - amount;

				await updateDoc(accountDocRef, {
					totalPendapatan: newTotal,
				});

				setRevenues((prev) =>
					prev.map((revenue) =>
						revenue.id === userId
							? { ...revenue, totalPendapatan: newTotal }
							: revenue
					)
				);

				console.log("Withdrawal successful: new total is", newTotal);
			}
		} catch (error) {
			console.error("Error processing withdrawal:", error);
		}
	};

	return (
		<div className="min-h-screen font-poppins dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 text-neutral-20">
			<HeaderSidebar
				isSidebarOpen={isSidebarOpen}
				toggleSidebar={setIsSidebarOpen}
			/>

			<aside
				id="sidebar-multi-level-sidebar"
				className={`fixed top-0 left-0 z-40 w-[280px] transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
					} sm:translate-x-0`}
				aria-label="Sidebar">
				<div className="h-full px-3 py-4 overflow-y-auto dark:bg-neutral-10 bg-neutral-100 dark:text-primary-100 text-neutral-10 pt-10">
					<NavigationItem />
				</div>
			</aside>

			<div className="p-8 sm:ml-[280px] h-full dark:bg-neutral-10 bg-primary-100 dark:text-primary-100 min-h-screen pt-24">
				<div className="breadcrumbs text-sm mt-1 mb-10">
					<Breadcrumbs />
				</div>

				<h1 className="text-2xl font-semibold mb-6">
					Daftar Pengguna dan Pendapatan
				</h1>

				{isLoading ? (
					<div className="flex justify-center items-center h-64 mt-20">
						<div className="animate-spin rounded-full h-60 w-60 border-b-2 border-gray-900"></div>
					</div>
				) : error ? (
					<div className="text-red-500 text-center mt-4">{error}</div>
				) : (
					<>
						<h2 className="text-xl font-semibold mb-4">
							Total Pendapatan: Rp. {totalRevenue.toLocaleString()}
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full bg-white border rounded-lg">
								<thead>
									<tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
										<th className="py-3 px-6 text-left">Username</th>
										<th className="py-3 px-6 text-left">Total Pendapatan</th>
										<th className="py-3 px-6 text-left">Aksi</th>
									</tr>
								</thead>
								<tbody className="text-gray-600 text-sm font-light">
									{revenues.length > 0 ? (
										revenues.map((revenue) => (
											<React.Fragment key={revenue.id}>
												<tr className="border-b border-gray-200 hover:bg-gray-100">
													<td
														className="py-3 px-6"
														onClick={() => toggleDropdown(revenue.id)}
													>
														{revenue.username} ▼
													</td>
													<td className="py-3 px-6">
														Rp. {revenue.totalPendapatan.toLocaleString()}
													</td>
													<td className="py-3 px-6">
														<button
															onClick={() => handleWithdraw(revenue.id, 50000)}
															className={`bg-blue-500 text-white px-4 py-1 rounded ${revenue.totalPendapatan < 50000 ? "opacity-50 cursor-not-allowed" : ""}`}
															disabled={revenue.totalPendapatan < 50000}
														>
															Riset
														</button>
													</td>
												</tr>

												{dropdownOpen[revenue.id] && (
													<tr>
														<td
															colSpan="3"
															className="bg-gray-100 text-left p-4"
														>
															<h3 className="font-semibold">Detail Rekening</h3>
															{accountDetails[revenue.id] ? (
																<>
																	<p>
																		Nama Rekening:{" "}
																		{accountDetails[revenue.id]
																			.namaPemilikRekening || "Tidak Diketahui"}
																	</p>
																	<p>
																		Nomor Rekening:{" "}
																		{accountDetails[revenue.id].nomorRekening ||
																			"Tidak Diketahui"}
																	</p>
																	<p>
																		Nama Bank:{" "}
																		{accountDetails[revenue.id].namaBank ||
																			"Tidak Diketahui"}
																	</p>
																</>
															) : (
																<p>Data rekening belum tersedia.</p>
															)}
														</td>
													</tr>
												)}
											</React.Fragment>
										))
									) : (
										<tr>
											<td colSpan="3" className="py-3 px-6 text-center">
												Tidak ada data pendapatan yang tersedia.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default AdminUserRevenue;
