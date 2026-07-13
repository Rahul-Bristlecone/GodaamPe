import { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/SubPage.css';
import '../styles/PickPage.css';
import { uploadEDIFile, getAllOrders, updateOrder, rejectOrderWithValidationErrors } from '../utils/orderService';
import { getAllStores } from '../utils/storeService';
import { getAllProducts } from '../utils/productService';
import { getAllCustomers } from '../utils/customerService';
import { getAllCompanies } from '../utils/companyService';

const REPORT_VIEWER_CONTEXT_KEY = 'reportViewerContext';

function PickPage({ username, onLogout, onBack, onNavigate }) {
    const importStatusTabs = ['Rejected', 'Unpicked', 'Downloading', 'Picking', 'Partially Filled', 'Filled', 'Completed'];
    const orderDetailTabs = ['Order details', 'Order summary', 'Carton details', 'Carton summary', 'Invoice summary'];
    const orderStatusOptions = ['pending', 'rejected', 'cancelled', 'outstanding', 'discarded', 'downloading', 'Picking', 'complete'];
    const poaStatusOptions = ['POA sent', 'POA not sent'];
    const carrierOptions = ['Select carrier', 'DHL', 'FedEx', 'Blue Dart', 'Delhivery'];
    const todayDate = getTodayDateString();
    const defaultOrderFormData = {
        orderStatus: 'pending',
        shipByDate: todayDate,
        notAfter: todayDate,
        notBefore: todayDate,
        dontPickBefore: todayDate,
        poaStatus: 'POA not sent',
        carrier: 'Select carrier',
        consignmentNoteNumber: '',
        quantityToDeliver: '',
        price: '',
        editComment: ''
    };

    const [orders, setOrders] = useState([]);
    const [activeImportTab, setActiveImportTab] = useState('Unpicked');
    const [storesById, setStoresById] = useState({});
    const [productsByBarcode, setProductsByBarcode] = useState({});
    const [customersByCode, setCustomersByCode] = useState({});
    const [companiesByCode, setCompaniesByCode] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderKey, setSelectedOrderKey] = useState('');
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [activeOrderDetailTab, setActiveOrderDetailTab] = useState('Order details');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showImportErrorDialog, setShowImportErrorDialog] = useState(false);
    const [importErrorSummary, setImportErrorSummary] = useState('');
    const [importErrorItems, setImportErrorItems] = useState([]);
    const [importErrorData, setImportErrorData] = useState(null);
    const [fallbackOrderNumber, setFallbackOrderNumber] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [contextMenu, setContextMenu] = useState(null);
    const [hoveredContextAction, setHoveredContextAction] = useState('');
    const [orderDrafts, setOrderDrafts] = useState({});
    const [orderFormData, setOrderFormData] = useState({
        orderStatus: 'pending',
        shipByDate: todayDate,
        notAfter: todayDate,
        notBefore: todayDate,
        dontPickBefore: todayDate,
        poaStatus: 'POA not sent',
        carrier: 'Select carrier',
        consignmentNoteNumber: '',
        quantityToDeliver: '',
        price: '',
        editComment: ''
    });

    const fetchStoresForLookup = async () => {
        const result = await getAllStores();
        if (!result.success) {
            return;
        }

        const storesList = Array.isArray(result.data) ? result.data : (result.data?.stores || []);
        const nextStoresById = storesList.reduce((accumulator, store) => {
            const storeId = store.store_id || store.id;
            const storeNumber = store.store_number;
            const storeName = store.store_name || store.name || '';
            if (storeId) {
                accumulator[storeId] = storeName;
            }
            if (storeNumber) {
                accumulator[storeNumber] = storeName;
            }
            return accumulator;
        }, {});

        setStoresById(nextStoresById);
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        const result = await getAllOrders();

        if (result.success) {
            const ordersList = Array.isArray(result.data) ? result.data : (result.data?.orders || []);
            setOrders(ordersList);
        } else {
            setError(result.error || 'Failed to fetch orders');
            setOrders([]);
        }
        setLoading(false);
    };

    // Fetch orders on component mount
    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            setLoading(true);
            setError('');

            const [ordersResult, storesResult, productsResult, customersResult, companiesResult] = await Promise.all([
                getAllOrders(),
                getAllStores(),
                getAllProducts(),
                getAllCustomers(),
                getAllCompanies(),
            ]);

            if (!isMounted) {
                return;
            }

            if (ordersResult.success) {
                const ordersList = Array.isArray(ordersResult.data) ? ordersResult.data : (ordersResult.data?.orders || []);
                setOrders(ordersList);
            } else {
                setError(ordersResult.error || 'Failed to fetch orders');
                setOrders([]);
            }

            if (storesResult.success) {
                const storesList = Array.isArray(storesResult.data) ? storesResult.data : (storesResult.data?.stores || []);
                const nextStoresById = storesList.reduce((accumulator, store) => {
                    const storeId = store.store_id || store.id;
                    const storeNumber = store.store_number;
                    const storeName = store.store_name || store.name || '';
                    if (storeId) {
                        accumulator[storeId] = storeName;
                    }
                    if (storeNumber) {
                        accumulator[storeNumber] = storeName;
                    }
                    return accumulator;
                }, {});

                setStoresById(nextStoresById);
            }

            if (productsResult.success) {
                const productList = Array.isArray(productsResult.data) ? productsResult.data : (productsResult.data?.products || []);
                const nextProductsByBarcode = productList.reduce((accumulator, product) => {
                    const barcode = String(product.barcode || product.product_barcode || '').trim();
                    if (!barcode) {
                        return accumulator;
                    }

                    accumulator[barcode] = {
                        productCode: product.product_code || product.code || product.productCode || '-',
                        taxRate: product.tax_rate ?? product.taxRate ?? product.gst_rate ?? product.tax ?? product.tax_percentage ?? '-',
                    };

                    return accumulator;
                }, {});

                setProductsByBarcode(nextProductsByBarcode);
            }

            if (customersResult.success) {
                const customerList = Array.isArray(customersResult.data) ? customersResult.data : (customersResult.data?.customers || []);
                const nextCustomersByCode = customerList.reduce((accumulator, customer) => {
                    const customerNo = String(customer.customer_no || customer.customerNumber || '').trim();
                    const customerId = String(customer.customer_id || customer.id || '').trim();
                    const customerName = customer.name || customer.customerName || customer.customer_name || customerNo || customerId;

                    if (customerNo) {
                        accumulator[customerNo] = customerName;
                    }

                    if (customerId) {
                        accumulator[customerId] = customerName;
                    }

                    return accumulator;
                }, {});

                setCustomersByCode(nextCustomersByCode);
            }

            if (companiesResult.success) {
                const companyList = Array.isArray(companiesResult.data) ? companiesResult.data : (companiesResult.data?.companies || []);
                const nextCompaniesByCode = companyList.reduce((accumulator, company) => {
                    const companyNo = String(company.company_no || company.companyNumber || '').trim();
                    const companyId = String(company.company_id || company.id || '').trim();
                    const companyName = company.name || company.companyName || company.company_name || companyNo || companyId;

                    if (companyNo) {
                        accumulator[companyNo] = companyName;
                    }

                    if (companyId) {
                        accumulator[companyId] = companyName;
                    }

                    return accumulator;
                }, {});

                setCompaniesByCode(nextCompaniesByCode);
            }

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!contextMenu) {
            return undefined;
        }

        const closeContextMenu = () => setContextMenu(null);
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setContextMenu(null);
            }
        };

        window.addEventListener('click', closeContextMenu);
        window.addEventListener('scroll', closeContextMenu, true);
        window.addEventListener('resize', closeContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('click', closeContextMenu);
            window.removeEventListener('scroll', closeContextMenu, true);
            window.removeEventListener('resize', closeContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [contextMenu]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];
        const fileContent = await file.text();
        const fallbackOrderNumber = extractOrderNumberFromFileContent(fileContent);

        // Validate file type
        const allowedTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv|edi)$/i)) {
            setError('Please upload a valid file (TXT, CSV, or EDI format)');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setDragOver(false);
        setShowImportErrorDialog(false);
        setImportErrorSummary('');
        setImportErrorItems([]);

        const result = await uploadEDIFile(file);

        if (result.success) {
            // File uploaded successfully, refetch orders from the API
            setSuccess('File uploaded successfully! Loading orders...');
            await fetchOrders();
            setTimeout(() => setSuccess(''), 4000);
        } else {
            const nextImportErrors = buildImportErrorState(result, { fallbackOrderNumber });
            setImportErrorSummary(nextImportErrors.summary);
            setImportErrorItems(nextImportErrors.items);
            setImportErrorData(result.errorData);
            setFallbackOrderNumber(fallbackOrderNumber);
            setFileContent(fileContent);
            setShowImportErrorDialog(true);
        }

        setLoading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const files = e.dataTransfer.files;
        handleFileUpload(files);
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        handleFileUpload(files);
    };

    const handleClearOrders = () => {
        fetchOrders();
        fetchStoresForLookup();
    };

    const getOrderKey = (order, index = 0) => {
        if (!order) {
            return `order-store-${index}`;
        }
        return `${order.order_id || 'order'}-${order.store_number || order.store_id || 'store'}-${index}`;
    };

    const getStatusForShipByDate = (status, shipByDate) => {
        const normalizedStatus = String(status || '').toLowerCase();
        const shouldAutoTogglePendingState = normalizedStatus === 'pending' || normalizedStatus === 'cancelled';

        if (!shouldAutoTogglePendingState) {
            return status || 'pending';
        }

        return isPastDate(shipByDate, todayDate) ? 'cancelled' : 'pending';
    };

    const getSavedOrderDraft = (orderKey) => {
        const savedDraft = orderDrafts[orderKey];
        if (!savedDraft) {
            return undefined;
        }

        const mergedDraft = {
            ...defaultOrderFormData,
            ...savedDraft
        };

        return {
            ...mergedDraft,
            orderStatus: getStatusForShipByDate(mergedDraft.orderStatus, mergedDraft.shipByDate)
        };
    };

    const getDisplayOrderStatus = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.orderStatus || order.order_status || 'pending';
    };

    const getDisplayShipByDate = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.shipByDate || order.ship_by_date || defaultOrderFormData.shipByDate;
    };

    const getDisplayNotAfterDate = (order, index) => {
        return getSavedOrderDraft(getOrderKey(order, index))?.notAfter || defaultOrderFormData.notAfter;
    };

    const getDisplayStoreName = (order) => {
        return order.store_name || storesById[order.store_number] || storesById[order.store_id] || 'Unknown Store';
    };

    const buildBaseOrderDraft = (order, index) => {
        if (!order) {
            return { ...defaultOrderFormData };
        }

        const orderKey = getOrderKey(order, index);
        const savedDraft = getSavedOrderDraft(orderKey);
        if (savedDraft) {
            return savedDraft;
        }

        return {
            ...defaultOrderFormData,
            orderStatus: order.order_status || 'pending',
            shipByDate: order.ship_by_date || defaultOrderFormData.shipByDate,
            notAfter: order.not_after || defaultOrderFormData.notAfter,
            notBefore: order.not_before || defaultOrderFormData.notBefore,
            dontPickBefore: order.dont_pick_before || defaultOrderFormData.dontPickBefore,
            poaStatus: getOrderPoaStatusLabel(order),
            carrier: order.carrier || defaultOrderFormData.carrier,
            consignmentNoteNumber: order.consignment_note_number || order.consignmentNoteNumber || defaultOrderFormData.consignmentNoteNumber,
            quantityToDeliver: order.quantity_to_deliver ?? '',
            price: order.unit_price ?? '',
            editComment: order.comment || order.notes || '',
        };
    };

    const getComparableOrderDraft = (draft) => {
        const normalizeStringOrEmpty = (value) => (value === undefined || value === null ? '' : String(value));

        return {
            ...defaultOrderFormData,
            ...draft,
            shipByDate: normalizeStringOrEmpty(draft?.shipByDate),
            quantityToDeliver: normalizeStringOrEmpty(draft?.quantityToDeliver),
            price: normalizeStringOrEmpty(draft?.price),
            editComment: normalizeStringOrEmpty(draft?.editComment),
        };
    };

    const getChangedOrderFormFields = (currentDraft, baseDraft) => {
        const comparableCurrent = getComparableOrderDraft(currentDraft);
        const comparableBase = getComparableOrderDraft(baseDraft);

        return Object.keys(comparableCurrent).filter((fieldName) => comparableCurrent[fieldName] !== comparableBase[fieldName]);
    };

    const initializeOrderSelection = (order, index) => {
        const orderKey = getOrderKey(order, index);
        setSelectedOrder(order);
        setSelectedOrderKey(orderKey);
        setOrderFormData(buildBaseOrderDraft(order, index));
        return orderKey;
    };

    const openOrderDetailsForRow = (order, index) => {
        initializeOrderSelection(order, index);
        setActiveOrderDetailTab('Order details');
        setShowOrderModal(false);
        setShowOrderDetailsModal(true);
    };

    const handleOrderClick = (order, index) => {
        openOrderDetailsForRow(order, index);
    };

    const openOrderModifyForRow = (order, index) => {
        initializeOrderSelection(order, index);
        setShowOrderDetailsModal(false);
        setShowOrderModal(true);
    };

    const applyOrderDraftUpdate = (order, index, updates, successMessage) => {
        const orderKey = getOrderKey(order, index);
        const nextDraft = {
            ...buildBaseOrderDraft(order, index),
            ...updates,
        };
        const isSelectedOrder = selectedOrderKey === orderKey;

        setOrderDrafts(prev => ({
            ...prev,
            [orderKey]: nextDraft,
        }));

        if (isSelectedOrder) {
            setSelectedOrder(prev => prev ? ({ ...prev, ...updates, order_status: nextDraft.orderStatus, poa_status: nextDraft.poaStatus }) : prev);
            setOrderFormData(prev => ({ ...prev, ...nextDraft }));
        }

        if (successMessage) {
            setSuccess(successMessage);
            setTimeout(() => setSuccess(''), 2500);
        }
    };

    const openOrderContextMenu = (event, order, index) => {
        event.preventDefault();

        const menuWidth = 244;
        const menuHeight = 292;
        const nextX = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
        const nextY = Math.min(event.clientY, window.innerHeight - menuHeight - 12);

        setHoveredContextAction('');
        setContextMenu({
            x: Math.max(12, nextX),
            y: Math.max(12, nextY),
            order,
            sourceIndex: index,
        });
    };

    const handleSendPoa = async (order, index) => {
        if (!order?.order_id) {
            setError('Unable to send POA: missing order id.');
            return;
        }

        setLoading(true);
        setError('');

        const baseDraft = buildBaseOrderDraft(order, index);
        const nullIfEmpty = (v) => (v === '' || v === undefined ? null : v);
        const updatePayload = {
            order_status: 'outstanding',
            ship_by_date: nullIfEmpty(baseDraft.shipByDate),
            not_after: nullIfEmpty(baseDraft.notAfter),
            not_before: nullIfEmpty(baseDraft.notBefore),
            dont_pick_before: nullIfEmpty(baseDraft.dontPickBefore),
            poa_status: 1,
            carrier: nullIfEmpty(baseDraft.carrier),
            consignment_note_number: nullIfEmpty(baseDraft.consignmentNoteNumber),
            quantity_to_deliver: baseDraft.quantityToDeliver !== '' && baseDraft.quantityToDeliver != null ? Number(baseDraft.quantityToDeliver) : null,
            unit_price: baseDraft.price !== '' && baseDraft.price != null ? Number(baseDraft.price) : null,
            comment: 'POA sent via system.',
        };

        const updateResult = await updateOrder(order.order_id, updatePayload);

        if (!updateResult.success) {
            setLoading(false);
            setError(updateResult.error || 'Failed to send POA.');
            return;
        }

        const updatedOrder = updateResult.data?.order || updateResult.data || {
            ...order,
            order_status: 'outstanding',
            poa_status: 1,
        };

        setOrders(prev => prev.map(o =>
            o.order_id === order.order_id
                ? { ...o, ...updatedOrder }
                : o
        ));

        if (selectedOrderKey === getOrderKey(order, index)) {
            setSelectedOrder(updatedOrder);
            setOrderFormData(prev => ({
                ...prev,
                orderStatus: 'outstanding',
                poaStatus: 'POA sent',
            }));
        }

        setSuccess('POA sent successfully. Order status updated to outstanding.');
        setTimeout(() => setSuccess(''), 2500);
        setLoading(false);
    };

    const handleRevalidateOrder = (order, index) => {
        const baseDraft = buildBaseOrderDraft(order, index);
        const nextStatus = isPastDate(baseDraft.shipByDate, todayDate) ? 'cancelled' : 'pending';
        applyOrderDraftUpdate(order, index, { orderStatus: nextStatus }, nextStatus === 'cancelled' ? 'Order revalidated, but remains cancelled because ship-by date is in the past.' : 'Order revalidated successfully.');
    };

    const handleRejectOrder = (order, index) => {
        applyOrderDraftUpdate(order, index, { orderStatus: 'rejected' }, 'Order marked as rejected.');
    };

    const handleGenerateDeliveryDocket = (order, index) => {
        const reportContext = {
            reportType: 'Delivery Docket',
            orderId: order.order_id || '',
            orderNumber: order.po_number || '-',
            customer: order.customer_name || customersByCode[String(order.customer_code || '')] || order.customer_code || '-',
            company: order.company_name || companiesByCode[String(order.company_code || '')] || order.company_code || '-',
            storeName: getDisplayStoreName(order),
            status: getDisplayOrderStatus(order, index),
            createdAt: order.created_at || '',
        };

        localStorage.setItem(REPORT_VIEWER_CONTEXT_KEY, JSON.stringify(reportContext));
        setContextMenu(null);

        if (onNavigate) {
            onNavigate('ABS Report viewer');
            return;
        }

        setSuccess('Delivery Docket report context prepared.');
        setTimeout(() => setSuccess(''), 2500);
    };

    const handleContextMenuAction = (actionKey) => {
        if (!contextMenu) {
            return;
        }

        const { order, sourceIndex } = contextMenu;
        const isPendingOrder = (getDisplayOrderStatus(order, sourceIndex) || '').toLowerCase() === 'pending';
        if (actionKey === 'send-poa' && !isPendingOrder) {
            return;
        }

        setHoveredContextAction('');
        setContextMenu(null);

        if (actionKey === 'send-poa') {
            handleSendPoa(order, sourceIndex);
        } else if (actionKey === 'revalidate-order') {
            handleRevalidateOrder(order, sourceIndex);
        } else if (actionKey === 'show-order-details') {
            openOrderDetailsForRow(order, sourceIndex);
        } else if (actionKey === 'edit-order-details') {
            openOrderModifyForRow(order, sourceIndex);
        } else if (actionKey === 'reject-order') {
            handleRejectOrder(order, sourceIndex);
        } else if (actionKey === 'generate-delivery-docket') {
            handleGenerateDeliveryDocket(order, sourceIndex);
        }
    };

    const getContextMenuItemStyle = (actionKey, disabled = false) => ({
        backgroundColor: disabled ? '#9ca77a' : (hoveredContextAction === actionKey ? '#654c87' : '#7e9146'),
        backgroundImage: 'none',
    });

    const isSendPoaEnabled = contextMenu
        ? (getDisplayOrderStatus(contextMenu.order, contextMenu.sourceIndex) || '').toLowerCase() === 'pending'
        : false;

    const closeOrderDetailsModal = () => {
        setShowOrderDetailsModal(false);
        setTimeout(() => {
            setSelectedOrder(null);
            setSelectedOrderKey('');
            setOrderFormData(defaultOrderFormData);
        }, 300);
    };

    const openModifyOrderModal = () => {
        setShowOrderDetailsModal(false);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setTimeout(() => {
            setSelectedOrder(null);
            setSelectedOrderKey('');
            setOrderFormData(defaultOrderFormData);
        }, 300);
    };

    const closeImportErrorDialog = () => {
        setShowImportErrorDialog(false);
        setImportErrorData(null);
        setFallbackOrderNumber('');
        setFileContent('');
    };

    const handleSaveOrderAsRejected = async () => {
        if (!importErrorData) {
            setError('Unable to save rejected order: missing error data.');
            closeImportErrorDialog();
            return;
        }

        if (!fileContent) {
            setError('Unable to save rejected order: missing file content.');
            closeImportErrorDialog();
            return;
        }

        setLoading(true);
        setError('');

        // Pass file content for backend to parse and extract all required fields
        const rejectPayload = {
            file_content: fileContent,
            order_status: 'rejected',
            errors: importErrorData?.errors || importErrorData?.message || 'Validation failed during import'
        };

        const result = await rejectOrderWithValidationErrors(rejectPayload);

        if (result.success) {
            setSuccess('Order saved as rejected and added to Rejected tab.');
            await fetchOrders();
            setTimeout(() => setSuccess(''), 3000);
            closeImportErrorDialog();
        } else {
            setError(result.error || 'Failed to save order as rejected.');
        }

        setLoading(false);
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'shipByDate'
                ? { orderStatus: getStatusForShipByDate(prev.orderStatus, value) }
                : {})
        }));
    };

    const handleSaveOrderChanges = async () => {
        if (!selectedOrderKey) {
            return;
        }

        if (!selectedOrder) {
            setError('Unable to update order: missing selected order.');
            return;
        }

        const baseOrderFormData = buildBaseOrderDraft(selectedOrder, 0) || defaultOrderFormData;
        const changedFields = getChangedOrderFormFields(orderFormData, baseOrderFormData);
        const commentOptionalFields = new Set(['shipByDate', 'quantityToDeliver', 'orderStatus']);
        const requiresEditComment = changedFields.some(fieldName => !commentOptionalFields.has(fieldName));

        if (requiresEditComment && !String(orderFormData.editComment || '').trim()) {
            setError('Comment is mandatory when editing an order.');
            return;
        }

        const nextOrderFormData = {
            ...orderFormData,
            orderStatus: getStatusForShipByDate(orderFormData.orderStatus, orderFormData.shipByDate)
        };

        if (!selectedOrder?.order_id) {
            setError('Unable to update order: missing order id.');
            return;
        }

        setLoading(true);
        setError('');

        const nullIfEmpty = (v) => (v === '' || v === undefined ? null : v);
        const updatePayload = {
            order_status: nextOrderFormData.orderStatus,
            ship_by_date: nullIfEmpty(nextOrderFormData.shipByDate),
            not_after: nullIfEmpty(nextOrderFormData.notAfter),
            not_before: nullIfEmpty(nextOrderFormData.notBefore),
            dont_pick_before: nullIfEmpty(nextOrderFormData.dontPickBefore),
            poa_status: mapPoaStatusToApiValue(nextOrderFormData.poaStatus),
            carrier: nullIfEmpty(nextOrderFormData.carrier),
            consignment_note_number: nullIfEmpty(nextOrderFormData.consignmentNoteNumber),
            quantity_to_deliver: nextOrderFormData.quantityToDeliver === '' || nextOrderFormData.quantityToDeliver == null ? null : Number(nextOrderFormData.quantityToDeliver),
            unit_price: nextOrderFormData.price === '' || nextOrderFormData.price == null ? null : Number(nextOrderFormData.price),
            comment: String(nextOrderFormData.editComment).trim(),
        };

        const updateResult = await updateOrder(selectedOrder.order_id, updatePayload);

        if (!updateResult.success) {
            setLoading(false);
            setError(updateResult.error || 'Failed to update order.');
            return;
        }

        const updatedOrder = updateResult.data?.order || updateResult.data || {
            ...selectedOrder,
            order_status: updatePayload.order_status,
            ship_by_date: updatePayload.ship_by_date,
            quantity_to_deliver: updatePayload.quantity_to_deliver,
            unit_price: updatePayload.unit_price,
            poa_status: updatePayload.poa_status,
            carrier: updatePayload.carrier,
            consignment_note_number: updatePayload.consignment_note_number,
            comment: updatePayload.comment,
        };

        setOrders(prev => prev.map(order =>
            order.order_id === selectedOrder.order_id
                ? { ...order, ...updatedOrder }
                : order
        ));

        // Clear the draft so the grid reads fresh from the updated order data
        setOrderDrafts(prev => {
            const next = { ...prev };
            delete next[selectedOrderKey];
            return next;
        });

        setSelectedOrder(updatedOrder);

        setSuccess('Order changes saved locally.');
        setTimeout(() => setSuccess(''), 2500);
        setLoading(false);
        closeOrderModal();
    };

    const baseOrderFormData = selectedOrder ? (buildBaseOrderDraft(selectedOrder, 0) || defaultOrderFormData) : defaultOrderFormData;
    const changedOrderFields = selectedOrder ? getChangedOrderFormFields(orderFormData, baseOrderFormData) : [];
    const hasShipByDateChanged = String(orderFormData.shipByDate || '') !== String(baseOrderFormData.shipByDate || '');
    const hasQuantityToDeliverChanged = String(orderFormData.quantityToDeliver ?? '') !== String(baseOrderFormData.quantityToDeliver ?? '');
    const hasOrderChanges = Boolean(selectedOrderKey && selectedOrder) && (changedOrderFields.length > 0 || hasShipByDateChanged || hasQuantityToDeliverChanged);
    const commentOptionalFields = new Set(['shipByDate', 'quantityToDeliver', 'orderStatus']);
    const requiresEditComment = changedOrderFields.some(fieldName => !commentOptionalFields.has(fieldName));
    const isEditCommentMissing = hasOrderChanges && requiresEditComment && !String(orderFormData.editComment || '').trim();
    const selectedOrderStoreName = selectedOrder
        ? (selectedOrder.store_name || storesById[selectedOrder.store_number] || storesById[selectedOrder.store_id] || 'Unknown Store')
        : '';
    const selectedOrderCustomerName = selectedOrder
        ? (selectedOrder.customer_name || customersByCode[String(selectedOrder.customer_code || '')] || customersByCode[String(selectedOrder.customer_id || '')] || selectedOrder.customer_code || '-')
        : '-';
    const selectedOrderCompanyName = selectedOrder
        ? (selectedOrder.company_name || companiesByCode[String(selectedOrder.company_code || '')] || companiesByCode[String(selectedOrder.company_id || '')] || selectedOrder.company_code || '-')
        : '-';
    const selectedOrderStatus = selectedOrder ? getDisplayOrderStatus(selectedOrder, 0) : 'pending';
    const selectedOrderPoaStatus = getOrderPoaStatusLabel(selectedOrder);
    const selectedOrderPoaSent = isOrderPoaSent(selectedOrder);
    const selectedOrderStatusColor = getStatusColor(selectedOrderStatus);
    const selectedOrderGridItems = getOrderDetailGridItems(selectedOrder, selectedOrderStoreName, productsByBarcode);
    const isOrderDetailsTab = activeOrderDetailTab === 'Order details';
    const visibleOrderGridItems = isOrderDetailsTab ? selectedOrderGridItems : [];
    const isOrderStatusLocked = isPastDate(orderFormData.shipByDate, todayDate);

    const getStatusBadgeStyle = (status, shipByDate) => {
        const statusLower = (status || '').toLowerCase();
        const isNotCancelledOrPending = statusLower !== 'cancelled' && statusLower !== 'pending';
        const isDatePassed = isPastDate(shipByDate, todayDate);
        
        if (isNotCancelledOrPending && isDatePassed) {
            return {
                backgroundColor: '#dc2626',
                color: '#ffffff'
            };
        }
        
        return {
            backgroundColor: getStatusColor(status),
            color: getStatusTextColor(status)
        };
    };

    const getImportTabStatusClass = (tab) => {
        const tabSlug = tab.toLowerCase().replace(/\s+/g, '-');
        return `status-${tabSlug}`;
    };

    const getOrderTabForStatus = (status) => {
        const normalizedStatus = (status || '').toLowerCase();

        if (normalizedStatus === 'rejected') {
            return 'Rejected';
        }

        if (normalizedStatus === 'pending') {
            return 'Unpicked';
        }

        if (normalizedStatus === 'downloading') {
            return 'Downloading';
        }

        if (normalizedStatus === 'picking') {
            return 'Picking';
        }

        if (normalizedStatus === 'completed' || normalizedStatus === 'complete') {
            return 'Completed';
        }

        return '';
    };

    const shouldShowOrderForActiveTab = (order, index) => {
        const orderStatus = getDisplayOrderStatus(order, index);
        const targetTab = getOrderTabForStatus(orderStatus);
        
        // Show pending/unpicked orders on Unpicked tab
        if (activeImportTab === 'Unpicked') {
            return !targetTab || targetTab === 'Unpicked';
        }
        
        // Show rejected orders on Rejected tab, and other specific statuses on their tabs
        return targetTab === activeImportTab;
    };

    const visibleOrders = orders.reduce((accumulator, order, index) => {
        if (shouldShowOrderForActiveTab(order, index)) {
            accumulator.push({ order, sourceIndex: index });
        }
        return accumulator;
    }, []);

    return (
        <div className="page-container pick-page">
            <Header username={username} onLogout={onLogout} onDashboard={onBack} />
            <div className="page-content">
                <div className="page-header">
                    <button onClick={onBack} className="back-button split-olive-button">
                        <span className="split-olive-button-text">Back to Dashboard</span>
                        <span className="split-olive-button-icon-wrap" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>
                    <h1>📋 Order Import</h1>
                </div>
                <div className="content-area">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Orders Display Section */}
                    {orders.length > 0 && (
                        <div className="orders-section">
                            <div className="orders-header">
                                <div className="orders-header-left">
                                    <span className="order-count">
                                        Total Orders: <strong>{visibleOrders.length}</strong>
                                    </span>
                                </div>
                                <div className="orders-header-center">
                                </div>
                                <div className="orders-header-right">
                                    <div className="orders-header-actions">
                                        <button
                                            className="file-select-button split-olive-button"
                                            disabled={loading}
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            <span className="split-olive-button-text">{loading ? 'Uploading...' : 'Upload File'}</span>
                                            <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                        <button
                                            className="refresh-button split-olive-button"
                                            onClick={handleClearOrders}
                                            disabled={loading}
                                        >
                                            <span className="split-olive-button-text">Refresh</span>
                                            <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                        <input
                                            id="file-input"
                                            type="file"
                                            className="drag-drop-input"
                                            onChange={handleFileInputChange}
                                            accept=".txt,.csv,.edi"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="import-status-tabs" aria-label="ABSPick import status tabs" role="tablist">
                                {importStatusTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`import-status-tab ${getImportTabStatusClass(tab)} ${activeImportTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveImportTab(tab)}
                                        role="tab"
                                        aria-selected={activeImportTab === tab}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="uploading-spinner">
                                    <p>Loading orders...</p>
                                </div>
                            ) : visibleOrders.length === 0 ? (
                                <div className="empty-state">
                                    No orders available for the selected tab.
                                </div>
                            ) : (
                                <div className="orders-table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order Number</th>
                                                <th>Customer</th>
                                                <th>Ship by</th>
                                                <th>Order Date</th>
                                                <th>Status</th>
                                                <th>Store Name</th>
                                                <th>Ordered Qty</th>
                                                <th>To Deliver</th>
                                                <th>Delivered</th>
                                                <th>Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleOrders.map(({ order, sourceIndex }) => (
                                                <tr 
                                                    key={order.order_id || sourceIndex}
                                                    onClick={() => handleOrderClick(order, sourceIndex)}
                                                    onContextMenu={(event) => openOrderContextMenu(event, order, sourceIndex)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>{order.po_number || '-'}</td>
                                                    <td>{order.customer_code || '-'}</td>
                                                    <td>
                                                        {formatDisplayDate(order.ship_by_date)}
                                                    </td>
                                                    <td>
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="order-status-badge"
                                                            style={getStatusBadgeStyle(getDisplayOrderStatus(order, sourceIndex), getDisplayShipByDate(order, sourceIndex))}
                                                        >
                                                            {getDisplayOrderStatus(order, sourceIndex)}
                                                        </span>
                                                    </td>
                                                    <td>{getDisplayStoreName(order)}</td>
                                                    <td>{order.ordered_quantity ?? 0}</td>
                                                    <td>{order.quantity_to_deliver ?? '-'}</td>
                                                    <td>{order.quantity_delivered ?? '-'}</td>
                                                    <td>
                                                        {order.currency} {order.total_amount ? order.total_amount.toFixed(2) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Section - Only show when no orders */}
                    {orders.length === 0 && !loading && (
                        <div className="upload-section">
                            <h2>Upload Order File</h2>
                            <div
                                className={`drag-drop-zone ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <div className="drag-drop-icon">📁</div>
                                <p className="drag-drop-text">Drag and drop your orders file here</p>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="drag-drop-input"
                                    onChange={handleFileInputChange}
                                    accept=".txt,.csv,.edi"
                                    disabled={loading}
                                />
                                <button
                                    className="file-select-button split-olive-button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input').click();
                                    }}
                                >
                                    <span className="split-olive-button-text">{loading ? 'Uploading...' : 'Select File'}</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State - No content yet */}
                    {loading && orders.length === 0 && (
                        <div className="uploading-spinner">
                            <p>Loading orders...</p>
                        </div>
                    )}

                    {contextMenu && (
                        <div
                            className="order-context-menu"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button type="button" disabled={!isSendPoaEnabled} style={getContextMenuItemStyle('send-poa', !isSendPoaEnabled)} className={`order-context-menu-item ${hoveredContextAction === 'send-poa' ? 'is-hovered' : ''} ${!isSendPoaEnabled ? 'is-disabled' : ''}`} onMouseEnter={() => isSendPoaEnabled && setHoveredContextAction('send-poa')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => isSendPoaEnabled && setHoveredContextAction('send-poa')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('send-poa')}>Send POA</button>
                            <button type="button" style={getContextMenuItemStyle('revalidate-order')} className={`order-context-menu-item ${hoveredContextAction === 'revalidate-order' ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredContextAction('revalidate-order')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => setHoveredContextAction('revalidate-order')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('revalidate-order')}>Revalidate order</button>
                            <button type="button" style={getContextMenuItemStyle('show-order-details')} className={`order-context-menu-item ${hoveredContextAction === 'show-order-details' ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredContextAction('show-order-details')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => setHoveredContextAction('show-order-details')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('show-order-details')}>Show Order details</button>
                            <button type="button" style={getContextMenuItemStyle('edit-order-details')} className={`order-context-menu-item ${hoveredContextAction === 'edit-order-details' ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredContextAction('edit-order-details')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => setHoveredContextAction('edit-order-details')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('edit-order-details')}>Edit order details</button>
                            <button type="button" style={getContextMenuItemStyle('reject-order')} className={`order-context-menu-item is-danger ${hoveredContextAction === 'reject-order' ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredContextAction('reject-order')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => setHoveredContextAction('reject-order')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('reject-order')}>Reject order</button>
                            <button type="button" style={getContextMenuItemStyle('generate-delivery-docket')} className={`order-context-menu-item ${hoveredContextAction === 'generate-delivery-docket' ? 'is-hovered' : ''}`} onMouseEnter={() => setHoveredContextAction('generate-delivery-docket')} onMouseLeave={() => setHoveredContextAction('')} onFocus={() => setHoveredContextAction('generate-delivery-docket')} onBlur={() => setHoveredContextAction('')} onClick={() => handleContextMenuAction('generate-delivery-docket')}>Generate DDR</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showImportErrorDialog && (
                <div className="order-details-modal" onClick={closeImportErrorDialog}>
                    <div className="import-error-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="import-error-dialog-header">
                            <div>
                                <h2>Import Errors</h2>
                                <p>{importErrorSummary}</p>
                            </div>
                            <button
                                type="button"
                                className="order-details-close"
                                onClick={closeImportErrorDialog}
                                aria-label="Close import errors dialog"
                            >
                                ×
                            </button>
                        </div>

                        <div className="import-error-dialog-body">
                            {importErrorItems.length > 0 ? (
                                <div className="import-error-list">
                                    {importErrorItems.map((item, index) => (
                                        <div key={`${item.title}-${index}`} className="import-error-item">
                                            <div className="import-error-item-title">{item.title}</div>
                                            <div
                                                className="import-error-item-detail"
                                                dangerouslySetInnerHTML={{ __html: item.detail }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="import-error-empty">The import could not be completed.</div>
                            )}
                        </div>

                        <div className="order-form-actions">
                            <div className="import-error-dialog-spacer" />
                            <div className="order-form-actions-right">
                                <button className="save-modal-button split-olive-button" onClick={handleSaveOrderAsRejected} disabled={loading}>
                                    <span className="split-olive-button-text">{loading ? 'Saving...' : 'Okay'}</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="close-modal-button split-olive-button" onClick={closeImportErrorDialog} disabled={loading}>
                                    <span className="split-olive-button-text">Close</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOrderDetailsModal && selectedOrder && (
                <div className="order-details-modal" onClick={closeOrderDetailsModal}>
                    <div className="order-insight-dialog config-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="config-dialog-header order-insight-header">
                            <div className="order-insight-left-block">
                                <h1>{activeOrderDetailTab}</h1>
                                <div className="dialog-tabs">
                                    {orderDetailTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            className={`dialog-tab ${activeOrderDetailTab === tab ? 'active' : ''}`}
                                            onClick={() => setActiveOrderDetailTab(tab)}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="order-store-name-block">
                                <div className="order-modal-meta-value">{selectedOrderCompanyName}</div>
                            </div>
                            <div className="order-insight-header-actions">
                                <button
                                    type="button"
                                    className="order-details-close"
                                    onClick={closeOrderDetailsModal}
                                    aria-label="Close order details"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="config-dialog-body order-insight-body">
                            <div className="order-insight-summary-grid">
                                <div className="order-insight-summary-main-grid">
                                    <div className="order-insight-summary-item">
                                        <span className="order-insight-summary-label">Customer name</span>
                                        <span className="order-insight-summary-value">{selectedOrderCustomerName}</span>
                                    </div>
                                    <div className="order-insight-summary-item">
                                        <span className="order-insight-summary-label">Order number</span>
                                        <span className="order-insight-summary-value">{selectedOrder.po_number || '-'}</span>
                                    </div>
                                    <div className="order-insight-summary-item">
                                        <span className="order-insight-summary-label">Total amount</span>
                                        <span className="order-insight-summary-value">{selectedOrder.currency} {selectedOrder.total_amount ? selectedOrder.total_amount.toFixed(2) : '-'}</span>
                                    </div>
                                </div>
                                <div className="order-insight-summary-side-grid">
                                    <div
                                        className="order-insight-summary-item order-insight-status-card"
                                        style={{ borderColor: selectedOrderStatusColor, borderTopColor: selectedOrderStatusColor }}
                                    >
                                        <span className="order-insight-summary-label">Order status</span>
                                        <span className="order-insight-summary-value order-insight-status-pill" style={getStatusBadgeStyle(selectedOrderStatus, orderFormData.shipByDate)}>
                                            {selectedOrderStatus}
                                        </span>
                                    </div>
                                    <div className="order-insight-summary-item order-insight-poa-card">
                                        <span className="order-insight-summary-label">POA status</span>
                                        <span className={`order-insight-summary-value order-insight-poa-pill ${selectedOrderPoaSent ? 'is-sent' : 'is-not-sent'}`}>
                                            {selectedOrderPoaStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-insight-table-wrap">
                                <table className="order-insight-table">
                                    <thead>
                                        <tr>
                                            <th>Store name</th>
                                            <th>Product code</th>
                                            <th>Ordered quantity</th>
                                            <th>Quantity to deliver</th>
                                            <th>Delivered quantities</th>
                                            <th>Price</th>
                                            <th>Tax rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleOrderGridItems.map((item, index) => (
                                            <tr key={`${item.productCode}-${index}`}>
                                                <td>{item.storeName}</td>
                                                <td>{item.productCode}</td>
                                                <td>{item.orderedQuantity}</td>
                                                <td>{item.quantityToDeliver}</td>
                                                <td>{item.deliveredQuantity}</td>
                                                <td>{item.price}</td>
                                                <td>{item.taxRate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="config-dialog-footer">
                            <div className="dialog-actions order-insight-actions">
                                <button type="button" className="order-help-button split-olive-button">
                                    <span className="split-olive-button-text">Help</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="close-modal-button split-olive-button" onClick={closeOrderDetailsModal}>
                                    <span className="split-olive-button-text">Close</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="save-order-button split-olive-button" onClick={openModifyOrderModal}>
                                    <span className="split-olive-button-text">Modify Order</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOrderModal && selectedOrder && (
                <div className="order-details-modal" onClick={closeOrderModal}>
                    <div className="order-details-content" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <div className="order-modal-title-block">
                                <h2>Modify Order</h2>
                                <p className="order-modal-subtitle">Order #{selectedOrder.po_number || '-'}</p>
                            </div>
                            <div className="order-store-name-block">
                                <div className="order-modal-meta-label">Store name</div>
                                <div className="order-modal-meta-value">{selectedOrderStoreName}</div>
                            </div>
                            <div className="order-modal-header-actions">
                                <span className="order-details-status order-status-badge" style={getStatusBadgeStyle(orderFormData.orderStatus, orderFormData.shipByDate)}>
                                    {(orderFormData.orderStatus || 'pending').toUpperCase()}
                                </span>
                                <button className="order-details-close" onClick={closeOrderModal} aria-label="Close modify order form">×</button>
                            </div>
                        </div>

                        <div className="order-form compact-order-form">
                            <div className="order-form-section">
                                <div className="order-form-section-title">Order Summary</div>
                                <div className="order-form-row order-form-row-two">
                                    <div className="order-form-group">
                                        <label htmlFor="quantityToDeliver">Quantity to deliver</label>
                                        <input
                                            id="quantityToDeliver"
                                            type="number"
                                            min="0"
                                            className="order-detail-input"
                                            name="quantityToDeliver"
                                            value={orderFormData.quantityToDeliver}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="price">Price</label>
                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="order-detail-input"
                                            name="price"
                                            value={orderFormData.price}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                </div>
                                <div className="order-form-row order-form-row-two">
                                    <div className="order-form-group">
                                        <label>Order Date</label>
                                        <div className="order-readonly-value">
                                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="carrier">Carrier</label>
                                        <select
                                            id="carrier"
                                            className="order-detail-input"
                                            name="carrier"
                                            value={orderFormData.carrier}
                                            onChange={handleOrderFormChange}
                                        >
                                            {carrierOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="order-form-row order-form-row-two">
                                    <div className="order-form-group">
                                        <label htmlFor="consignmentNoteNumber">Consignment note number</label>
                                        <input
                                            id="consignmentNoteNumber"
                                            type="text"
                                            className="order-detail-input"
                                            name="consignmentNoteNumber"
                                            value={orderFormData.consignmentNoteNumber}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="editComment">Comment *</label>
                                        <textarea
                                            id="editComment"
                                            className="order-detail-textarea"
                                            name="editComment"
                                            value={orderFormData.editComment}
                                            onChange={handleOrderFormChange}
                                            placeholder="Add a comment for this order update"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="order-form-section">
                                <div className="order-form-section-title">Order Controls</div>
                                <div className="order-controls-grid">
                                    <div className="order-form-group">
                                        <label htmlFor="shipByDate">Ship by</label>
                                        <input
                                            id="shipByDate"
                                            type="date"
                                            className="order-detail-input"
                                            name="shipByDate"
                                            value={orderFormData.shipByDate}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="notAfter">Not after</label>
                                        <input
                                            id="notAfter"
                                            type="date"
                                            className="order-detail-input"
                                            name="notAfter"
                                            value={orderFormData.notAfter}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="orderStatus">Status</label>
                                        <select
                                            id="orderStatus"
                                            className="order-detail-input"
                                            name="orderStatus"
                                            value={orderFormData.orderStatus}
                                            onChange={handleOrderFormChange}
                                            disabled={true}
                                        >
                                            {orderStatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="notBefore">Not before</label>
                                        <input
                                            id="notBefore"
                                            type="date"
                                            className="order-detail-input"
                                            name="notBefore"
                                            value={orderFormData.notBefore}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="dontPickBefore">Don't pick before</label>
                                        <input
                                            id="dontPickBefore"
                                            type="date"
                                            className="order-detail-input"
                                            name="dontPickBefore"
                                            value={orderFormData.dontPickBefore}
                                            onChange={handleOrderFormChange}
                                        />
                                    </div>
                                    <div className="order-form-group">
                                        <label htmlFor="poaStatus">POA status</label>
                                        <select
                                            id="poaStatus"
                                            className="order-detail-input"
                                            name="poaStatus"
                                            value={orderFormData.poaStatus}
                                            onChange={handleOrderFormChange}
                                            disabled={true}
                                        >
                                            {poaStatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="order-items-section">
                                <h3>Order Items ({selectedOrder.items.length})</h3>
                                <div className="order-items-list">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="order-item-card">
                                            <strong>{item.product_name || item.name || `Item ${index + 1}`}</strong>
                                            <div>
                                                {item.product_code && <div><strong>Code:</strong> {item.product_code}</div>}
                                                {item.quantity && <div><strong>Quantity:</strong> {item.quantity}</div>}
                                                {item.unit_price && <div><strong>Unit Price:</strong> {selectedOrder.currency} {item.unit_price}</div>}
                                                {item.total_price && <div><strong>Total:</strong> {selectedOrder.currency} {item.total_price}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="order-form-actions">
                            <button type="button" className="order-help-button split-olive-button">
                                <span className="split-olive-button-text">Help</span>
                                <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>
                            </button>
                            <div className="order-form-actions-right">
                                <button className="close-modal-button split-olive-button" onClick={closeOrderModal}>
                                    <span className="split-olive-button-text">Close</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="save-order-button split-olive-button" onClick={handleSaveOrderChanges} disabled={!hasOrderChanges || isEditCommentMissing || loading}>
                                    <span className="split-olive-button-text">Save Changes</span>
                                    <span className="split-olive-button-icon-wrap" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="m20 6-11 11-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Helper function to get status badge color
 */
function getStatusColor(status) {
    if (!status) return '#a0aec0';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'rejected') {
        return '#dc2626';
    } else if (statusLower === 'cancelled') {
        return '#f56565';
    } else if (statusLower === 'pending') {
        return '#ed8936';
    } else if (statusLower === 'outstanding') {
        return '#48bb78';
    } else if (statusLower === 'downloading') {
        return '#b794f4';
    } else if (statusLower === 'picking') {
        return '#ecc94b';
    } else if (statusLower === 'discarded') {
        return '#a0aec0';
    } else if (statusLower === 'completed' || statusLower === 'complete') {
        return '#4299e1';
    }
    return '#667eea';
}

function getStatusTextColor(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'picking') {
        return '#2d3748';
    }
    return '#ffffff';
}

function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isPastDate(dateValue, todayDate) {
    return Boolean(dateValue) && dateValue < todayDate;
}

function formatDisplayDate(dateValue) {
    if (!dateValue) {
        return '-';
    }

    const normalizedDate = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(normalizedDate.getTime())) {
        return dateValue;
    }

    return normalizedDate.toLocaleDateString();
}

function getOrderDetailGridItems(order, storeName, productsByBarcode) {
    if (!order) {
        return [];
    }

    const items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0) {
        const priceValue = order.unit_price ?? '-';
        const orderProductLookup = getProductLookupFromSources(productsByBarcode, [
            order.barcode,
            order.product_barcode,
            order.productBarcode,
            order.item_barcode,
            order.ean,
            order.upc,
        ]);
        return [{
            storeName: storeName || '-',
            productCode: orderProductLookup.productCode || order.product_code || order.productCode || '-',
            orderedQuantity: order.ordered_quantity ?? 0,
            quantityToDeliver: order.quantity_to_deliver ?? '-',
            deliveredQuantity: order.quantity_delivered ?? '-',
            price: priceValue === '-' ? '-' : `${order.currency || ''} ${Number(priceValue).toFixed(2)}`,
            taxRate: order.tax_rate ?? order.taxRate ?? '-',
        }];
    }

    return items.map((item) => {
        const productLookup = getProductLookupFromSources(productsByBarcode, [
            item.barcode,
            item.product_barcode,
            item.productBarcode,
            item.item_barcode,
            item.ean,
            item.upc,
            order.barcode,
            order.product_barcode,
        ]);
        const priceValue = item.unit_price ?? item.price ?? '-';

        return {
            storeName: storeName || '-',
            productCode: productLookup.productCode || item.product_code || item.productCode || '-',
            orderedQuantity: item.ordered_quantity ?? item.quantity ?? order.ordered_quantity ?? 0,
            quantityToDeliver: item.quantity_to_deliver ?? order.quantity_to_deliver ?? '-',
            deliveredQuantity: item.quantity_delivered ?? order.quantity_delivered ?? '-',
            price: priceValue === '-' ? '-' : `${order.currency || ''} ${Number(priceValue).toFixed(2)}`,
            taxRate: item.tax_rate ?? item.taxRate ?? order.tax_rate ?? order.taxRate ?? '-',
        };
    });
}

function isOrderPoaSent(order) {
    const poaValue = order?.poa_status ?? order?.poaStatus;

    if (poaValue === null || poaValue === undefined || poaValue === '') {
        return false;
    }

    if (typeof poaValue === 'number') {
        return poaValue > 0;
    }

    const normalizedValue = String(poaValue).trim().toLowerCase();
    if (!normalizedValue) {
        return false;
    }

    if (normalizedValue === '0' || normalizedValue === 'false' || normalizedValue === 'no' || normalizedValue === 'not sent' || normalizedValue === 'poa not sent') {
        return false;
    }

    if (normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === 'sent' || normalizedValue === 'poa sent') {
        return true;
    }

    return normalizedValue.includes('sent') && !normalizedValue.includes('not');
}

function getOrderPoaStatusLabel(order) {
    return isOrderPoaSent(order) ? 'POA sent' : 'POA not sent';
}

function mapPoaStatusToApiValue(poaStatus) {
    if (poaStatus === null || poaStatus === undefined || poaStatus === '') {
        return 0;
    }

    if (typeof poaStatus === 'number') {
        return poaStatus > 0 ? 1 : 0;
    }

    if (typeof poaStatus === 'boolean') {
        return poaStatus ? 1 : 0;
    }

    const normalizedValue = String(poaStatus).trim().toLowerCase();
    if (!normalizedValue) {
        return 0;
    }

    if (normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === 'sent' || normalizedValue === 'poa sent') {
        return 1;
    }

    if (normalizedValue === '0' || normalizedValue === 'false' || normalizedValue === 'no' || normalizedValue === 'not sent' || normalizedValue === 'poa not sent') {
        return 0;
    }

    return normalizedValue.includes('sent') && !normalizedValue.includes('not') ? 1 : 0;
}

function getProductLookupFromSources(productsByBarcode, barcodeSources) {
    const candidates = Array.isArray(barcodeSources) ? barcodeSources : [barcodeSources];

    for (const candidate of candidates) {
        const lookup = getProductLookupByBarcode(productsByBarcode, candidate);
        if (lookup) {
            return lookup;
        }
    }

    return {};
}

function getProductLookupByBarcode(productsByBarcode, barcodeValue) {
    if (!barcodeValue) {
        return null;
    }

    const exactKey = String(barcodeValue).trim();
    if (!exactKey) {
        return null;
    }

    return productsByBarcode[exactKey] || productsByBarcode[exactKey.replace(/^0+/, '')] || null;
}

function buildImportErrorState(result, options = {}) {
    const rawMessage = result?.errorData?.message || result?.errorData?.msg || result?.error || 'Failed to import the file.';
    const summary = /^EDIFACT validation failed:/i.test(rawMessage)
        ? 'The import file contains validation errors. Fix the issues below and try again.'
        : 'The order import could not be completed.';
    const items = extractImportErrorEntries(result?.errorData, rawMessage)
        .map((entry) => formatImportErrorItem(entry, options))
        .filter(Boolean);

    return {
        summary,
        items: items.length > 0 ? items : [{ title: 'Import failed', detail: rawMessage }],
    };
}

function extractImportErrorEntries(errorData, fallbackMessage) {
    if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        return errorData.errors.map((entry) => String(entry));
    }

    if (errorData?.errors && typeof errorData.errors === 'object') {
        return Object.values(errorData.errors).flatMap((value) => Array.isArray(value) ? value : [value]).map((entry) => String(entry));
    }

    return String(fallbackMessage)
        .replace(/^EDIFACT validation failed:\s*/i, '')
        .split(/\s*;\s*/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function formatImportErrorItem(rawEntry, options = {}) {
    const normalizedEntry = String(rawEntry).replace(/^EDIFACT validation failed:\s*/i, '').trim();
    const lowerEntry = normalizedEntry.toLowerCase();
    const isServiceUnavailable = /httpconnectionpool|newconnectionerror|failed to establish a new connection|connection refused|max retries exceeded/.test(lowerEntry);

    if (lowerEntry.includes('already exists') && (lowerEntry.includes('po_number') || lowerEntry.includes('po number') || lowerEntry.includes('order'))) {
        const orderNumber = extractOrderNumberFromError(normalizedEntry) || options.fallbackOrderNumber || '';
        return {
            title: 'Order already exists',
            detail: orderNumber
                ? `Order number <strong class="import-error-highlight">${escapeHtml(orderNumber)}</strong> already exists.`
                : 'Order number already exists.',
        };
    }

    if (lowerEntry.includes('customer')) {
        const customerCode = extractValidationValueFromError(normalizedEntry);
        return {
            title: 'Customer not found',
            detail: isServiceUnavailable
                ? 'Customer validation service is unavailable, so the customer could not be verified.'
                : customerCode
                    ? `Customer <strong class="import-error-highlight">${escapeHtml(customerCode)}</strong> does not exist.`
                    : stripKnownPrefix(normalizedEntry, /^failed to validate customer:\s*/i),
        };
    }

    if (lowerEntry.includes('company')) {
        const companyCode = extractValidationValueFromError(normalizedEntry);
        return {
            title: 'Company not found',
            detail: isServiceUnavailable
                ? 'Company validation service is unavailable, so the company could not be verified.'
                : companyCode
                    ? `Company <strong class="import-error-highlight">${escapeHtml(companyCode)}</strong> does not exist.`
                    : stripKnownPrefix(normalizedEntry, /^failed to validate company:\s*/i),
        };
    }

    if (lowerEntry.includes('store') || lowerEntry.includes('location')) {
        const storeNumber = extractValidationValueFromError(normalizedEntry);
        return {
            title: 'Store not found',
            detail: isServiceUnavailable
                ? 'Store validation service is unavailable, so the store could not be verified.'
                : storeNumber
                    ? `Store <strong class="import-error-highlight">${escapeHtml(storeNumber)}</strong> does not exist.`
                    : stripKnownPrefix(normalizedEntry, /^failed to validate store:\s*/i),
        };
    }

    if (lowerEntry.includes('price mismatch')) {
        const mismatch = extractPriceMismatchDetails(normalizedEntry);
        return {
            title: 'Product Price mismatch',
            detail: mismatch.productCode
                ? `Price mismatch for product <strong class="import-error-highlight">${escapeHtml(mismatch.productCode)}</strong>. Order price: ${escapeHtml(mismatch.orderPrice || '-')}, Existing price: ${escapeHtml(mismatch.existingPrice || '-')}`
                : normalizedEntry,
        };
    }

    if (lowerEntry.includes('product') || lowerEntry.includes('barcode')) {
        const productBarcode = extractValidationValueFromError(normalizedEntry);
        return {
            title: 'Product not found',
            detail: isServiceUnavailable
                ? 'Product validation service is unavailable, so the product could not be verified.'
                : productBarcode
                    ? `Product with barcode <strong class="import-error-highlight">${escapeHtml(productBarcode)}</strong> does not exist.`
                    : stripKnownPrefix(normalizedEntry, /^failed to validate product:\s*/i),
        };
    }

    if ((lowerEntry.includes('po number') || lowerEntry.includes('po_number')) && /(not provided|missing|required|empty)/.test(lowerEntry)) {
        return {
            title: 'PO number is missing',
            detail: stripKnownPrefix(normalizedEntry, /^failed to validate po number:\s*/i),
        };
    }

    if (lowerEntry.includes('invalid price') || lowerEntry.includes('price')) {
        return {
            title: 'Invalid price',
            detail: normalizedEntry,
        };
    }

    return {
        title: isServiceUnavailable ? 'Validation service unavailable' : 'Import validation error',
        detail: normalizedEntry,
    };
}

function stripKnownPrefix(value, pattern) {
    return value.replace(pattern, '').trim() || value;
}

function extractOrderNumberFromError(value) {
    const explicitValuePatterns = [
        /order number\s*[:=-]\s*["']?([A-Za-z0-9][A-Za-z0-9-]*)/i,
        /po(?:[_\s-]?number)?\s*[:=-]\s*["']?([A-Za-z0-9][A-Za-z0-9-]*)/i,
        /\bpo\s+[A-Za-z0-9][A-Za-z0-9-]*/i,
        /\bPO-\d{4}-\d+\b/i,
    ];

    for (const pattern of explicitValuePatterns) {
        const match = value.match(pattern);
        if (match?.[1]) {
            return match[1].trim();
        }

        if (match?.[0]) {
            return match[0].replace(/^po\s+/i, '').trim();
        }
    }

    const patterns = [
        /order number\s*[:=-]?\s*["']?([^,"'\s;()]+)/i,
        /po(?:[_\s-]?number)?\s*[:=-]?\s*["']?([^,"'\s;()]+)/i,
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        const candidate = match?.[1]?.trim();
        if (candidate && !/^_?number$/i.test(candidate) && !/^po_?number$/i.test(candidate)) {
            return candidate;
        }
    }

    return '';
}

function extractOrderNumberFromFileContent(value) {
    const content = String(value || '');
    const patterns = [
        /\bPO-\d{4}-\d+\b/i,
        /BGM\+[^+]*\+([A-Za-z0-9][A-Za-z0-9-]*)/i,
        /RFF\+ON:([A-Za-z0-9][A-Za-z0-9-]*)/i,
        /ON\+([A-Za-z0-9][A-Za-z0-9-]*)/i,
        /po(?:[_\s-]?number)?\s*[,=:]\s*([A-Za-z0-9][A-Za-z0-9-]*)/i,
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match?.[1]) {
            return match[1].trim();
        }

        if (match?.[0]) {
            return match[0].trim();
        }
    }

    return '';
}

function extractValidationValueFromError(value) {
    const patterns = [
        /value\s*=\s*["']?([^,"'\]\s]+)/i,
        /for value\s*[=:]\s*["']?([^,"'\]\s]+)/i,
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1]) {
            return match[1].trim();
        }
    }

    return '';
}

function extractPriceMismatchDetails(value) {
    const productCode = value.match(/product\s+["']([^"']+)["']/i)?.[1]
        || value.match(/product\s+([A-Za-z0-9-]+)/i)?.[1]
        || '';
    const orderPrice = value.match(/(?:edifact|order)\s+price\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1] || '';
    const existingPrice = value.match(/db\s+price\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1]
        || value.match(/existing\s+price\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1]
        || '';

    return {
        productCode,
        orderPrice,
        existingPrice,
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default PickPage;
