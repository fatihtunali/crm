'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCreateSupplier } from '@/lib/api/hooks/use-suppliers';
import { useParties, useCreateParty } from '@/lib/api/hooks/use-parties';
import { SupplierType } from '@/lib/api/endpoints/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const supplierTypeLabels: Record<SupplierType, string> = {
  [SupplierType.HOTEL]: 'Hotel',
  [SupplierType.TRANSPORT]: 'Transport',
  [SupplierType.ACTIVITY_OPERATOR]: 'Activity Operator',
  [SupplierType.GUIDE_AGENCY]: 'Guide Agency',
  [SupplierType.OTHER]: 'Other',
};

export default function NewSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<'party' | 'supplier'>('party');
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  // Party form state
  const [partyData, setPartyData] = useState({
    name: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  // Supplier form state
  const [supplierData, setSupplierData] = useState({
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

  const { data: parties } = useParties();
  const createParty = useCreateParty();
  const createSupplier = useCreateSupplier();

  const handlePartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartyId) {
      setStep('supplier');
    } else {
      const result = await createParty.mutateAsync(partyData);
      setSelectedPartyId(result.data.id);
      setStep('supplier');
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId) return;

    await createSupplier.mutateAsync({
      partyId: selectedPartyId,
      type: supplierData.type,
      bankName: supplierData.bankName || undefined,
      bankAccountNo: supplierData.bankAccountNo || undefined,
      bankIban: supplierData.bankIban || undefined,
      bankSwift: supplierData.bankSwift || undefined,
      paymentTerms: supplierData.paymentTerms || undefined,
      defaultCurrency: supplierData.defaultCurrency,
      creditLimit: supplierData.creditLimit ? parseFloat(supplierData.creditLimit) : undefined,
      commissionPct: parseFloat(supplierData.commissionPct),
    });

    router.push(`/${locale}/suppliers`);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">New Supplier</h1>
        <p className="text-gray-700 mt-1 text-base">
          {step === 'party'
            ? 'Step 1: Select or create a company'
            : 'Step 2: Add supplier details'}
        </p>
      </div>

      {step === 'party' ? (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePartySubmit} className="space-y-6">
              <div>
                <Label>Select Existing Company (Optional)</Label>
                <Select
                  value={selectedPartyId?.toString() || ''}
                  onValueChange={(value: string) => setSelectedPartyId(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties?.data?.map((party) => (
                      <SelectItem key={party.id} value={party.id.toString()}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedPartyId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={partyData.name}
                        onChange={(e) => setPartyData({ ...partyData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={partyData.taxId}
                        onChange={(e) => setPartyData({ ...partyData, taxId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={partyData.phone}
                        onChange={(e) => setPartyData({ ...partyData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={partyData.email}
                        onChange={(e) => setPartyData({ ...partyData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={partyData.address}
                      onChange={(e) => setPartyData({ ...partyData, address: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={partyData.city}
                        onChange={(e) => setPartyData({ ...partyData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={partyData.country}
                        onChange={(e) => setPartyData({ ...partyData, country: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={partyData.postalCode}
                        onChange={(e) => setPartyData({ ...partyData, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button type="submit">
                  {selectedPartyId ? 'Continue' : 'Create Company & Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupplierSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Supplier Type *</Label>
                  <Select
                    value={supplierData.type}
                    onValueChange={(value: string) =>
                      setSupplierData({ ...supplierData, type: value as SupplierType })
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
                    value={supplierData.defaultCurrency}
                    onValueChange={(value: string) =>
                      setSupplierData({ ...supplierData, defaultCurrency: value })
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
                      value={supplierData.bankName}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, bankName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccountNo">Account Number</Label>
                    <Input
                      id="bankAccountNo"
                      value={supplierData.bankAccountNo}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, bankAccountNo: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankIban">IBAN</Label>
                    <Input
                      id="bankIban"
                      value={supplierData.bankIban}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, bankIban: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankSwift">SWIFT/BIC</Label>
                    <Input
                      id="bankSwift"
                      value={supplierData.bankSwift}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, bankSwift: e.target.value })
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
                      value={supplierData.paymentTerms}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, paymentTerms: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      value={supplierData.creditLimit}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, creditLimit: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionPct">Commission %</Label>
                    <Input
                      id="commissionPct"
                      type="number"
                      step="0.01"
                      value={supplierData.commissionPct}
                      onChange={(e) =>
                        setSupplierData({ ...supplierData, commissionPct: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep('party')}>
                  Back
                </Button>
                <Button type="submit">Create Supplier</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
