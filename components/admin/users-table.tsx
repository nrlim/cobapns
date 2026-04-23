"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  MoreHorizontal,
  Search,
  Settings2,
  Shield,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSub,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  updateUserTier,
  toggleUserStatus,
  updateUserRole,
} from "@/app/admin/users/actions";
import { SubscriptionTier, Role } from "@prisma/client";

type UserData = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
};

interface UsersTableProps {
  data: UserData[];
}

export function UsersTable({ data }: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "name",
      header: "User Profile",
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-100 ">
              <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
              <AvatarFallback className="bg-blue-50 text-brand-blue-deep  ">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-slate-900 ">{user.name}</span>
              <span className="text-xs text-slate-500 ">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <div className="flex w-[100px] items-center gap-2">
            {role === "ADMIN" ? (
              <Badge
                variant="outline"
                className="border-indigo-200 bg-indigo-50 text-indigo-700   "
              >
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-700   "
              >
                <UserIcon className="mr-1 h-3 w-3" />
                Student
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "subscriptionTier",
      header: "Subscription",
      cell: ({ row }) => {
        const tier = row.getValue("subscriptionTier") as string;

        if (tier === "MASTER") {
          return (
            <Badge className="bg-indigo-600 hover:bg-indigo-700">
              Master
            </Badge>
          );
        }

        if (tier === "ELITE") {
          return (
            <Badge className="bg-brand-blue hover:bg-brand-blue-deep">
              Elite
            </Badge>
          );
        }

        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Free
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></span>
            </span>
            <span
              className={`text-sm font-medium ${isActive ? "text-emerald-700 " : "text-red-700 "}`}
            >
              {isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Activity",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date;
        return (
          <span className="text-sm text-slate-500  whitespace-nowrap">
            {formatDistanceToNow(new Date(date), {
              addSuffix: true,
              locale: localeID,
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Aksi Akun</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Ubah Langganan</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => updateUserTier(user.id, "MASTER")}
                    >
                      Jadikan Master
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUserTier(user.id, "ELITE")}
                    >
                      Jadikan Elite
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUserTier(user.id, "FREE")}
                    >
                      Jadikan Free
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Ubah Peran</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => updateUserRole(user.id, "ADMIN")}
                    >
                      Set sebagai Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUserRole(user.id, "STUDENT")}
                    >
                      Set sebagai Student
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={
                  user.isActive
                    ? "text-red-600 focus:bg-red-50 focus:text-red-600 :bg-red-950/50"
                    : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 :bg-emerald-950/50"
                }
                onClick={() => toggleUserStatus(user.id, user.isActive)}
              >
                {user.isActive ? "Banned Pengguna" : "Aktifkan Pengguna"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, filterValue) => {
      const name = row.original.name.toLowerCase();
      const email = row.original.email.toLowerCase();
      const search = filterValue.toLowerCase();
      return name.includes(search) || email.includes(search);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full pl-9 bg-white "
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                {table.getColumn("subscriptionTier")?.getFilterValue() 
                  ? `Tier: ${table.getColumn("subscriptionTier")?.getFilterValue() === "FREE" ? "Free" : table.getColumn("subscriptionTier")?.getFilterValue() === "ELITE" ? "Elite" : "Master"}`
                  : "Filter Tier"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Pilih Tier</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("subscriptionTier")?.setFilterValue(undefined)}>
                Semua Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("subscriptionTier")?.setFilterValue("MASTER")}>
                Master
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("subscriptionTier")?.setFilterValue("ELITE")}>
                Elite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("subscriptionTier")?.setFilterValue("FREE")}>
                Free
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Table Wrap / ScrollArea for Mobile */}
      <div className="rounded-xl border border-slate-200 bg-white   shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-slate-50/80 ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Tidak ada pengguna ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden">
          <ScrollArea className="h-[calc(100vh-350px)] rounded-xl">
            {table.getRowModel().rows?.length ? (
              <div className="flex flex-col gap-0 divide-y divide-slate-100 ">
                {table.getRowModel().rows.map((row) => (
                  <div key={row.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      {flexRender(
                        row.getVisibleCells()[0].column.columnDef.cell,
                        row.getVisibleCells()[0].getContext(),
                      )}
                      {flexRender(
                        row.getVisibleCells()[5].column.columnDef.cell,
                        row.getVisibleCells()[5].getContext(),
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {flexRender(
                        row.getVisibleCells()[1].column.columnDef.cell,
                        row.getVisibleCells()[1].getContext(),
                      )}
                      {flexRender(
                        row.getVisibleCells()[2].column.columnDef.cell,
                        row.getVisibleCells()[2].getContext(),
                      )}
                      {flexRender(
                        row.getVisibleCells()[3].column.columnDef.cell,
                        row.getVisibleCells()[3].getContext(),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                Tidak ada pengguna ditemukan.
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-slate-500 ">
          Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
