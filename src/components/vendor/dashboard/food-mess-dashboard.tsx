
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Utensils, PlusCircle, Users, IndianRupee, ChefHat, Phone, MessageCircle } from "lucide-react";
import Link from 'next/link';
import type { Product } from "@/lib/types";

type FoodMessDashboardProps = {
    products: Product[];
    orders: any[];
};

export default function FoodMessDashboard({ products, orders }: FoodMessDashboardProps) {
    const menuItems = products; // Products are already filtered for this category
    const messListing = products.find(product => product.category === 'Food Mess');
    const recentOrders = orders.slice(0, 3);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const mealPlanEntries = messListing?.meal_plan ? [
        { label: 'Breakfast', value: messListing?.meal_plan?.breakfast },
        { label: 'Lunch', value: messListing?.meal_plan?.lunch },
        { label: 'Dinner', value: messListing?.meal_plan?.dinner },
    ].filter(entry => entry.value) : [];
    const contactPhone = messListing?.phone_number;
    const contactWhatsApp = messListing?.whatsapp_number;
    const subscriptionPrice = messListing?.subscription_price;
    const specialNotes = messListing?.special_notes;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Food Mess Management</h2>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Utensils className="text-primary"/> Meal Plan</CardTitle>
                        <CardDescription>Quick view of the current menu cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {mealPlanEntries.length > 0 ? (
                            <ul className="space-y-2">
                                {mealPlanEntries.map(plan => (
                                    <li key={plan.label} className="rounded-lg border p-3">
                                        <p className="font-semibold text-foreground">{plan.label}</p>
                                        <p className="text-muted-foreground">{plan.value}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">Add your breakfast, lunch, and dinner details to reassure parents and students.</p>
                        )}
                        {subscriptionPrice != null && (
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="font-semibold text-foreground mb-1">Monthly subscription</p>
                                <p className="text-muted-foreground">₹{subscriptionPrice.toLocaleString('en-IN')}/mo</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Subscriber Summary</CardTitle>
                        <CardDescription>Keep track of recurring diners.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-lg border p-3">
                            <p className="font-semibold text-foreground">Active orders</p>
                            <p className="text-muted-foreground">{orders.length} live orders</p>
                        </div>
                        {specialNotes ? (
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="font-semibold text-foreground">Special notes</p>
                                <p className="text-muted-foreground mt-1">{specialNotes}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Share dietary policies, delivery timings, or hygiene commitments here.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Phone className="text-primary"/> Contact Channels</CardTitle>
                        <CardDescription>Ensure hungry students can reach you quickly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone className="size-4 text-primary"/>
                            {contactPhone ? (
                                <span>{contactPhone}</span>
                            ) : (
                                <span className="text-muted-foreground">Add a phone number in your listing.</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="size-4 text-green-500"/>
                            {contactWhatsApp ? (
                                <span>{contactWhatsApp}</span>
                            ) : (
                                <span className="text-muted-foreground">Share a WhatsApp contact for faster confirmations.</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ChefHat className="text-primary"/> Recent Orders</CardTitle>
                        <CardDescription>A snapshot of your latest food orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.buyer?.full_name || 'N/A'}</TableCell>
                                            <TableCell>{order.order_items.map((oi: any) => oi.products?.name || 'Unknown Item').join(', ')}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'Ready' ? 'default' : order.status === 'Pending' ? 'destructive' : 'secondary'}>
                                                    {order.status || 'Pending'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <p className="text-muted-foreground text-center py-10">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>

                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IndianRupee className="text-primary"/> Total Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">from {orders.length} orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Subscriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-muted-foreground text-center py-4">Subscription feature coming soon!</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Utensils className="text-primary"/> Menu Management</CardTitle>
                        <CardDescription>Update your daily menu and prices.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/vendor/products/new?category=Food Mess">
                            <PlusCircle className="mr-2"/> Add Menu Item
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {menuItems.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dish Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>₹{item.price}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/vendor/products/${item.id}/edit`}>Edit</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <p className="text-muted-foreground text-center py-10">No menu items found. <Link href="/vendor/products/new?category=Food Mess" className="text-primary underline">Add one now</Link>.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
