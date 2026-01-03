import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalDate } from '../utils/dateUtils';

export const useTrips = () => {
    const [trips, setTrips] = useState([]);
    const [routePresets, setRoutePresets] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [isSupabaseReady, setIsSupabaseReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Test connection
                const { error } = await supabase.from('trips').select('id').limit(1);

                if (error) {
                    console.warn('Supabase connection warning:', error);
                    // If table doesn't exist or connection failed, we might fall back, 
                    // but for now let's try to proceed if it's just an empty table or soft error
                    if (error.code === 'PGRST116') { /* empty result is fine */ }
                    else throw error;
                }

                setIsSupabaseReady(true);
                await Promise.all([fetchTrips(), fetchPresets()]);

                const tripsSubscription = supabase
                    .channel('trips_channel')
                    .on('postgres_changes', { event: '*', table: 'trips' }, () => {
                        fetchTrips();
                    })
                    .subscribe();

                setLoading(false);
                return () => supabase.removeChannel(tripsSubscription);
            } catch (err) {
                console.error('Supabase init failed:', err);
                loadLocalData();
            }
        };

        init();
    }, []);

    const loadLocalData = () => {
        const savedTrips = localStorage.getItem('fleet_management_trips');
        const savedPresets = localStorage.getItem('fleet_route_presets');
        const tripsArray = savedTrips ? JSON.parse(savedTrips) : [];
        setTrips(tripsArray.map(normalizeTrip));
        setRoutePresets(savedPresets ? JSON.parse(savedPresets) : {});
        setIsSupabaseReady(false);
        setLoading(false);
    };

    const normalizeTrip = (t) => {
        // DRIVE NAME: Look for any common column name
        const driverName = t.driver_name || t.driverName || t.driver || t.staff || t.name || '';

        // BASKET SHARE (ส่วนแบ่งตะกร้า): Priority: basketShare -> basket_share -> staff_share
        const basketShare = parseFloat(t.basketShare) || parseFloat(t.basket_share) || parseFloat(t.staff_share) || 0;
        // STAFF SHARE (ยอดเบิก/Advance): Priority: staffShare -> advance -> staff_advance -> staff_share (as fallback)
        const staffShare = parseFloat(t.staffShare) || parseFloat(t.advance) || parseFloat(t.staff_advance) || 0;

        return {
            ...t,
            id: t.id,
            driverName,
            price: parseFloat(t.price) || 0,
            fuel: parseFloat(t.fuel) || 0,
            wage: parseFloat(t.wage) || 0,
            basket: parseFloat(t.basket) || 0,
            maintenance: parseFloat(t.maintenance) || 0,
            profit: parseFloat(t.profit) || 0,
            basketCount: parseInt(t.basket_count || t.basketCount || 0),
            basketShare,
            staffShare,
            date: (() => {
                if (!t.date) return getLocalDate();
                if (typeof t.date === 'string') return t.date.split('T')[0];
                const d = new Date(t.date);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            })()
        };
    };

    const fetchTrips = async () => {
        try {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .order('date', { ascending: false });

            if (!error && data) {
                setTrips(data.map(normalizeTrip));
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchPresets = async () => {
        try {
            const { data, error } = await supabase.from('route_presets').select('*');
            if (!error && data) {
                const presets = {};
                data.forEach(p => {
                    presets[p.route] = { price: p.price, wage: p.wage };
                });
                setRoutePresets(presets);
            }
        } catch (err) {
            console.error('Presets error:', err);
        }
    };

    const calculateStats = (tripsToProcess) => {
        return tripsToProcess.reduce((acc, t) => {
            const price = parseFloat(t.price) || 0;
            const wage = parseFloat(t.wage) || 0;
            const fuel = parseFloat(t.fuel) || 0;
            const maintenance = parseFloat(t.maintenance) || 0;
            const basketRevenue = parseFloat(t.basket) || 0;
            const basketShare = parseFloat(t.basketShare) || 0;
            const advance = parseFloat(t.staffShare) || 0;

            return {
                totalTrips: acc.totalTrips + 1,
                totalRevenue: acc.totalRevenue + price + basketRevenue,
                totalWages: acc.totalWages + wage,
                totalFuel: acc.totalFuel + fuel,
                totalMaintenance: acc.totalMaintenance + maintenance,
                totalBasket: acc.totalBasket + basketShare,
                totalStaffAdvance: acc.totalStaffAdvance + advance,
                totalProfit: acc.totalProfit + (price + basketRevenue) - (wage + fuel + maintenance + basketShare),
                totalRemainingPay: acc.totalRemainingPay + (wage + basketShare + 1000) - advance
            };
        }, {
            totalTrips: 0, totalRevenue: 0, totalWages: 0, totalFuel: 0,
            totalMaintenance: 0, totalBasket: 0, totalStaffAdvance: 0, totalProfit: 0, totalRemainingPay: 0
        });
    };

    const stats = useMemo(() => {
        const currentMonthTrips = trips.filter(t => {
            const tripDate = new Date(t.date);
            return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
        });
        return calculateStats(currentMonthTrips);
    }, [trips, currentMonth, currentYear]);

    const yearlyStats = useMemo(() => {
        const currentYearTrips = trips.filter(t => new Date(t.date).getFullYear() === currentYear);
        return calculateStats(currentYearTrips);
    }, [trips, currentYear]);

    const calculateProfit = (price, fuel, wage, basket, staffShare, maintenance, basketShare) => {
        return (parseFloat(price) || 0) + (parseFloat(basket) || 0) - (parseFloat(fuel) || 0) - (parseFloat(wage) || 0) - (parseFloat(maintenance) || 0) - (parseFloat(basketShare) || 0);
    };

    const addTrip = async (trip) => {
        const price = parseFloat(trip.price) || 0;
        const fuel = parseFloat(trip.fuel) || 0;
        const wage = parseFloat(trip.wage) || 0;
        const basket = parseFloat(trip.basket) || 0;
        const staffShare = parseFloat(trip.staffShare) || 0; // ยอดเบิก (Advance)
        const basketShare = parseFloat(trip.basketShare) || 0; // ส่วนแบ่งตะกร้า
        const maintenance = parseFloat(trip.maintenance) || 0;
        const basketCount = parseInt(trip.basketCount) || 0;
        const profit = calculateProfit(price, fuel, wage, basket, staffShare, maintenance, basketShare);

        const baseData = {
            date: trip.date || getLocalDate(),
            route: trip.route,
            price, fuel, wage, profit
        };

        if (isSupabaseReady) {
            // We search for a payload that actually works without throwing "column not found"
            const attempts = [
                // 1. Full attempt with standardized columns
                { ...baseData, driver_name: trip.driverName || '', basket, maintenance, staff_share: basketShare, advance: staffShare, basket_count: basketCount },
                // 2. Try camelCase driverName
                { ...baseData, driverName: trip.driverName || '', basket, maintenance, staff_share: basketShare, advance: staffShare, basket_count: basketCount },
                // 3. Try 'name'
                { ...baseData, name: trip.driverName || '', basket, maintenance, staff_share: basketShare, advance: staffShare },
                // 4. Try 'driver'
                { ...baseData, driver: trip.driverName || '', basket, maintenance, staff_share: basketShare, advance: staffShare },
                // 5. Minimal Financial
                { ...baseData, basket, maintenance, staff_share: basketShare, advance: staffShare },
                // 6. Bare Minimal
                { ...baseData }
            ];

            let success = false;
            for (const payload of attempts) {
                try {
                    const { data, error } = await supabase.from('trips').insert([payload]).select();
                    if (!error && data?.[0]) {
                        setTrips(prev => [normalizeTrip(data[0]), ...prev]);
                        success = true;
                        break;
                    }
                } catch (err) { }
            }
            if (!success) alert('ไม่สามารถบันทึกได้ กรุณารีเฟรชหน้าแล้วลองใหม่');
        } else {
            const localTrip = normalizeTrip({ ...baseData, id: Date.now(), driverName: trip.driverName, basket, maintenance, staffShare, basketShare, basketCount });
            setTrips(prev => [localTrip, ...prev]);
        }
    };

    const deleteTrip = async (id) => {
        if (isSupabaseReady) {
            await supabase.from('trips').delete().eq('id', id);
        }
        setTrips(prev => prev.filter(t => t.id !== id));
    };

    const updateTrip = async (id, updatedFields) => {
        const normalized = normalizeTrip(updatedFields);
        const profit = calculateProfit(normalized.price, normalized.fuel, normalized.wage, normalized.basket, normalized.staffShare, normalized.maintenance, normalized.basketShare);

        const baseUpdate = {
            date: normalized.date, route: normalized.route,
            price: normalized.price, fuel: normalized.fuel, wage: normalized.wage,
            profit
        };

        if (isSupabaseReady) {
            const attempts = [
                { ...baseUpdate, driverName: normalized.driverName, basket: normalized.basket, maintenance: normalized.maintenance, staff_share: normalized.basketShare, advance: normalized.staffShare, basket_share: normalized.basketShare, basket_count: normalized.basketCount },
                { ...baseUpdate, driver_name: normalized.driverName, basket: normalized.basket, maintenance: normalized.maintenance, staff_share: normalized.basketShare, advance: normalized.staffShare, basket_share: normalized.basketShare, basket_count: normalized.basketCount },
                { ...baseUpdate, basket: normalized.basket, maintenance: normalized.maintenance, staff_share: normalized.basketShare, advance: normalized.staffShare },
                { ...baseUpdate }
            ];

            for (const payload of attempts) {
                const { error } = await supabase.from('trips').update(payload).eq('id', id);
                if (!error) break;
            }
        }
        setTrips(prev => prev.map(t => t.id === id ? { ...normalized, id, profit } : t));
    };

    const getTripsForMonth = (month, year) => {
        return trips.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const deletePreset = async (route) => {
        if (isSupabaseReady) await supabase.from('route_presets').delete().eq('route', route);
        const updated = { ...routePresets };
        delete updated[route];
        setRoutePresets(updated);
    };

    return {
        trips, routePresets, loading, currentMonth, currentYear,
        setCurrentMonth, setCurrentYear, fetchTrips, addTrip, deleteTrip, updateTrip, deletePreset,
        stats, yearlyStats, getTripsForMonth
    };
};
