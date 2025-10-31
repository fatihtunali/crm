'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupplier, useUpdateSupplier } from '@/lib/api/hooks/use-suppliers';
import { SupplierType } from '@/lib/api/endpoints/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const supplierTypeLabels: Record<SupplierType, string> = {
  [SupplierType.HOTEL]: 'Hotel',
  [SupplierType.TRANSPORT]: 'Transport',
  [SupplierType.ACTIVITY_OPERATOR]: 'Activity Operator',
  [SupplierType.GUIDE_AGENCY]: 'Guide Agency',
  [SupplierType.OTHER]: 'Other',
};

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const id = parseInt(params.id as string);

  const { data: supplierResponse, isLoading } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();

  const [formData, setFormData] = useState({
    type: SupplierType.HOTEL,
    bankName: '',
    bankAccountNo: '',
    bankIban: '',
    bankSwift: '',
    paymentTerms: '',
    defaultCurrency: 'TRY',
    creditLimit: '',
    commissionPct: '0',
  });

  useEffect(() => {
    if (supplierResponse?.data) {
      const supplier = supplierResponse.data;
      setFormData({
        type: supplier.type,
        bankName: supplier.bankName || '',
        bankAccountNo: supplier.bankAccountNo || '',
        bankIban: supplier.bankIban || '',
        bankSwift: supplier.bankSwift || '',
        paymentTerms: supplier.paymentTerms || '',
        defaultCurrency: supplier.defaultCurrency,
        creditLimit: supplier.creditLimit?.toString() || '',
        commissionPct: supplier.commissionPct?.toString() || '0',
      });
    }
  }, [supplierResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateSupplier.mutateAsync({
      id,
      data: {
        type: formData.type,
        bankName: formData.bankName || undefined,
        bankAccountNo: formData.bankAccountNo || undefined,
        bankIban: formData.bankIban || undefined,
        bankSwift: formData.bankSwift || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        defaultCurrency: formData.defaultCurrency,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        commissionPct: parseFloat(formData.commissionPct),
      },
    });

    router.push(`/${locale}/suppliers`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!supplierResponse?.data) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Supplier not found</h2>
          <Link href={`/${locale}/suppliers`}>
            <Button className="mt-4">Back to Suppliers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const supplier = supplierResponse.data;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/suppliers`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
        <p className="text-gray-700 mt-1 text-base">
          Update supplier details for {supplier.party?.name}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={supplier.party?.name || ''} disabled />
            </div>
            <div>
              <Label>Tax ID</Label>
              <Input value={supplier.party?.taxId || 'N/A'} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={supplier.party?.phone || 'N/A'} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={supplier.party?.email || 'N/A'} disabled />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            To update company information, please edit the party record directly.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Supplier Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as SupplierType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(supplierTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={formData.defaultCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultCurrency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bank Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountNo">Account Number</Label>
                  <Input
                    id="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={(e) =>
                      setFormData({ ...formData, bankAccountNo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankIban">IBAN</Label>
                  <Input
                    id="bankIban"
                    value={formData.bankIban}
                    onChange={(e) =>
                      setFormData({ ...formData, bankIban: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bankSwift">SWIFT/BIC</Label>
                  <Input
                    id="bankSwift"
                    value={formData.bankSwift}
                    onChange={(e) =>
                      setFormData({ ...formData, bankSwift: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Terms</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., Net 30"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, creditLimit: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="commissionPct">Commission %</Label>
                  <Input
                    id="commissionPct"
                    type="number"
                    step="0.01"
                    value={formData.commissionPct}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionPct: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href={`/${locale}/suppliers`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateSupplier.isPending}>
                {updateSupplier.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
