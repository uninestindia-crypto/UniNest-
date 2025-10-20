
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Computer, IndianRupee, PlusCircle, Check, Clock, Server, Phone, MessageCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Product } from "@/lib/types";
import Link from "next/link";

const usageData = [
  { time: '10 AM', users: 5 }, { time: '11 AM', users: 8 },
  { time: '12 PM', users: 12 }, { time: '1 PM', users: 15 },
  { time: '2 PM', users: 14 }, { time: '3 PM', users: 18 },
  { time: '4 PM', users: 22 }, { time: '5 PM', users: 20 },
  { time: '6 PM', users: 16 },
];

type CybercafeDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function CybercafeDashboard({ products, orders }: CybercafeDashboardProps) {
    const services = products; // products are already filtered for this category
    const cafeListing = products.find(product => product.category === 'Cyber Café' || product.category === 'Cybercafé');
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const stats = { revenue: totalRevenue, orders: orders.length };
    const hourlySlots = cafeListing?.hourly_slots ?? [];
    const servicesOffered = cafeListing?.services_offered ?? [];
    const equipmentSpecs = cafeListing?.equipment_specs;
    const contactPhone = cafeListing?.phone_number;
    const contactWhatsApp = cafeListing?.whatsapp_number;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Cybercafé Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Plans/Services</CardTitle>
                        <Computer className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{services.length}</p>
                        <p className="text-sm text-muted-foreground">Active service listings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Orders</CardTitle>
                        <Check className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.orders}</p>
                         <p className="text-sm text-muted-foreground">Across all services</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                         <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                         <p className="text-sm text-muted-foreground">from all-time sales</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="text-primary"/> Hourly Slots</CardTitle>
                        <CardDescription>Track availability windows for customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {hourlySlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {hourlySlots.map(slot => (
                                    <span key={slot} className="rounded-full border px-3 py-1 text-muted-foreground">{slot}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Add hourly slots in your listing so walk-ins know when they can book.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server className="text-primary"/> Services & Equipment</CardTitle>
                        <CardDescription>Highlight the experience your café provides.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold mb-1">Services</p>
                            {servicesOffered.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {servicesOffered.map(service => (
                                        <li key={service}>{service}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Mention services like gaming PCs, printing, scanning, or design stations.</p>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Equipment Specs</p>
                            {equipmentSpecs ? (
                                <p className="text-muted-foreground whitespace-pre-wrap">{equipmentSpecs}</p>
                            ) : (
                                <p className="text-muted-foreground">Detail your hardware to attract e-sports teams and freelancers.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Phone className="text-primary"/> Contact</CardTitle>
                        <CardDescription>Keep support lines visible for quick bookings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone className="size-4 text-primary"/>
                            {contactPhone ? <span>{contactPhone}</span> : <span className="text-muted-foreground">Add a phone number to your listing.</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="size-4 text-green-500"/>
                            {contactWhatsApp ? <span>{contactWhatsApp}</span> : <span className="text-muted-foreground">Include a WhatsApp number to confirm slots faster.</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Usage Hours</CardTitle>
                        <CardDescription>Identify when your café is busiest (demo data).</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={usageData}>
                                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))' 
                                    }}
                                    label="Users"
                                />
                                <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <CardTitle>Rate Plans</CardTitle>
                            <CardDescription>Manage your service pricing.</CardDescription>
                        </div>
                        <Button asChild>
                           <Link href="/vendor/products/new?category=Cybercafé">
                             <PlusCircle className="mr-2"/> Add New Plan
                           </Link>
                        </Button>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {services.length > 0 ? (
                            services.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Computer className="size-5 text-primary" />
                                        <span className="font-semibold">{plan.name}</span>
                                    </div>
                                    <span className="font-bold">₹{plan.price.toLocaleString()}/hr</span>
                                </div>
                            ))
                         ) : (
                            <p className="text-muted-foreground text-center py-10">No service plans found. <Link href="/vendor/products/new?category=Cybercafé" className="text-primary underline">Add a plan now</Link>.</p>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
