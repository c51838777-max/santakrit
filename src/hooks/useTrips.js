import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useTrips = () => {
    const [trips, setTrips] = useState([]);
    const [routePresets, setRoutePresets] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
        fetchPresets();

        const channel = supabase.channel('trips_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
                fetchTrips();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const fetchTrips = async () => {
        const { data, error } = await supabase.from('trips').select('*').order('date', { ascending: false });
        if (!error) setTrips(data);
        setLoading(false);
    };

    const fetchPresets = async () => {
        const { data, error } = await supabase.from('route_presets').select('*');
        if (!error) {
            const presets = {};
            data.forEach(p => presets[p.route_name] = { price: p.price, wage: p.wage });
            setRoutePresets(presets);
        }
    };

    const uploadFile = async (file, path) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('bills')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        const { data } = supabase.storage.from('bills').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const addTrip = async (trip) => {
        const fuelUrl = await uploadFile(trip.fuelBill, 'fuel');
        const maintenanceUrl = await uploadFile(trip.maintenanceBill, 'maintenance');
        const basketUrl = await uploadFile(trip.basketBill, 'basket');

        const price = parseFloat(trip.price) || 0;
        const fuel = parseFloat(trip.fuel) || 0;
        const wage = parseFloat(trip.wage) || 0;
        const maintenance = parseFloat(trip.maintenance) || 0;
        const basket = parseFloat(trip.basket) || 0;
        const basketShare = parseFloat(trip.basketShare) || 0;
        const advance = parseFloat(trip.staffShare) || 0; // ยอดเบิก

        // Profit calculation logic (matching Admin Dashboard)
        const profit = (price + basket) - (fuel + wage + maintenance + basketShare);

        const payload = {
            date: trip.date,
            driver_name: trip.driverName,
            route: trip.route,
            price,
            fuel,
            wage,
            maintenance,
            basket_count: parseInt(trip.basketCount) || 0,
            basket,
            staff_share: basketShare, // Match Admin's naming (staff_share in DB = basketShare in UI)
            advance,
            fuel_bill_url: fuelUrl,
            maintenance_bill_url: maintenanceUrl,
            basket_bill_url: basketUrl,
            profit: profit
        };

        const { data, error } = await supabase.from('trips').insert([payload]).select();

        return { data, error };
    };

    return { trips, routePresets, loading, addTrip };
};
