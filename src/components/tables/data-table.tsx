'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchBar } from '@/components/forms/search-bar';
import { ConfirmDialog } from '@/components/forms/confirm-dialog';
import { Edit, Trash2, Plus } from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction {
  label: string;
  icon: React.ReactNode;
  onClick: (item: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

interface DataTableProps {
  title: string;
  description?: string;
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable({
  title,
  description,
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  };

  const filteredData = data.filter(item =>
    columns.some(column => {
      const value = item[column.key];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const defaultActions: TableAction[] = [];
  if (onEdit) {
    defaultActions.push({
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
      variant: 'ghost',
    });
  }
  if (onDelete) {
    defaultActions.push({
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'ghost',
    });
  }

  const allActions = [...defaultActions, ...actions];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
        {searchable && (
          <div className="pt-4">
            <SearchBar
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                {allActions.length > 0 && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </TableCell>
                  ))}
                  {allActions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {allActions.map((action, actionIndex) => (
                          <ConfirmDialog
                            key={actionIndex}
                            title={`${action.label} Item`}
                            description={`Are you sure you want to ${action.label.toLowerCase()} this item?`}
                            onConfirm={() => action.onClick(item)}
                            trigger={
                              <Button
                                variant={action.variant || 'ghost'}
                                size="sm"
                                className={action.className}
                              >
                                {action.icon}
                              </Button>
                            }
                            confirmText={action.label}
                            variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                          />
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

