document.addEventListener('DOMContentLoaded', function() {

    console.log("DOM fully loaded and parsed. Running script.js...");

    // --- Check if ECharts is available ---
    if (typeof echarts === 'undefined') {
        console.error("ERROR: ECharts library not found! Make sure the ECharts CDN script is loaded BEFORE your script.js.");
        const chartContainers = document.querySelectorAll('.chart-container > div[id$="Chart"]');
        chartContainers.forEach(container => {
            if (container) {
                 container.innerHTML = "<p style='text-align:center; color:red;'>Error loading charts: ECharts library not found.</p>";
                 container.style.height = 'auto';
            }
        });
        return;
    } else {
        console.log("ECharts library detected.");
    }


    // --- Sidebar Navigation Logic ---
    const sidebarLinks = document.querySelectorAll('.sidebar-nav ul li a');
    const pageContents = document.querySelectorAll('.page-content');
    const headerTitle = document.querySelector('.top-header .header-title');
    const sidebarListItems = document.querySelectorAll('.sidebar-nav ul li');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            const targetId = this.getAttribute('data-target');
            console.log("Sidebar link clicked, target:", targetId);
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                console.log("Target content found:", targetContent);
                pageContents.forEach(content => content.classList.remove('active-content'));
                sidebarListItems.forEach(item => item.classList.remove('active'));

                targetContent.classList.add('active-content');
                this.parentElement.classList.add('active');

                const linkText = this.querySelector('span').textContent;
                headerTitle.textContent = linkText;
                console.log("Header title updated to:", linkText);

                if (targetId === 'home-content') {
                    console.log("Navigated to home page, attempting to initialize charts after a short delay.");
                    setTimeout(initializeCharts, 150);
                }
            } else {
                 console.warn("Target content with ID '" + targetId + "' not found!");
            }
        });
    });

    // --- Initial Chart Initialization on Load ---
    const initialActivePage = document.querySelector('.page-content.active-content');
    if (initialActivePage && initialActivePage.id === 'home-content') {
        console.log("Initial active page is home page. Attempting to initialize charts after a short delay.");
         setTimeout(initializeCharts, 150);
    } else {
         console.log("Initial active page is not home page, charts will not be initialized on load.");
    }


    // --- ECharts Initialization Functions ---
    let lineChartInstance = null;
    let radarChartInstance = null;
    let pieChartInstance = null;
    let barChartInstance = null;

    function initializeCharts() {
        console.log("-> initializeCharts() called");
        if (typeof echarts === 'undefined') {
             console.error("initializeCharts called but ECharts is not defined.");
             return;
        }
        initLineChart();
        initRadarChart();
        initPieChart();
        initBarChart();

        if (!window._chartResizeListenerAdded) {
             console.log("Adding chart resize listener.");
             window.addEventListener('resize', resizeCharts);
             window._chartResizeListenerAdded = true;
        }
         console.log("<- initializeCharts() finished");
    }

    function resizeCharts() {
        console.log("-> resizeCharts() called");
        lineChartInstance?.resize();
        radarChartInstance?.resize();
        pieChartInstance?.resize();
        barChartInstance?.resize();
         console.log("<- resizeCharts() finished");
    }

    // --- Line Chart (Using Direct Colors) ---
    function initLineChart() {
        console.log("-- Attempting to initialize Line Chart --");
        const chartDom = document.getElementById('lineChart');
        console.log("--- Line chart DOM element found:", chartDom);

        if (!chartDom) {
             console.error("--- ERROR: Line chart DOM element with ID 'lineChart' NOT found! Cannot initialize.");
             const container = document.querySelector('.chart-container.large-chart');
             if(container) container.innerHTML = "<p style='text-align:center; color:red; padding-top: 80px;'>Error: Chart element not found.</p>";
             return;
        }

        const existingInstance = echarts.getInstanceByDom(chartDom);
        if (existingInstance) {
             console.log("--- Line chart already initialized. Resizing.");
             lineChartInstance = existingInstance;
             lineChartInstance.resize();
             return;
        }

        try {
            console.log("--- Initializing new Line Chart instance...");
            lineChartInstance = echarts.init(chartDom);
            console.log("--- Line chart instance created.");

            const option = {
                 tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
                 legend: {
                     data: ['pv', 'ip'],
                     right: '30px',
                     top: '5px',
                     icon: 'circle',
                     // Use direct colors for legend items to ensure they show
                     itemStyle: {
                        color: '#e94b78', // PV color
                        // You might need to define color for 'ip' explicitly too if needed
                        // color: '#4a90e2' // IP color - ECharts might handle this automatically based on series
                     }
                 },
                 grid: { left: '2%', right: '3%', bottom: '10%', containLabel: true },
                 xAxis: {
                     type: 'category', boundaryGap: false, data: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
                     axisTick: { alignWithLabel: true }, axisLine: { lineStyle: { color: '#ddd' } }, axisLabel: { color: '#666' }
                 },
                 yAxis: {
                     type: 'value', axisLine: { show: true, lineStyle: { color: '#ddd' } },
                     axisLabel: { color: '#666' }, splitLine: { lineStyle: { color: '#eee', type: 'dashed' } }
                 },
                 series: [
                     {
                         name: 'pv', type: 'line', smooth: true,
                         data: [2000, 1800, 1900, 3200, 2300, 2500, 4200],
                         itemStyle: { color: '#e94b78' }, // Direct Red color
                         lineStyle: { width: 2 }, showSymbol: true, symbol: 'circle', symbolSize: 6
                     },
                     {
                         name: 'ip', type: 'line', smooth: true,
                         data: [2000, 1200, 1250, 1300, 1800, 1750, 1700],
                         itemStyle: { color: '#4a90e2' }, // Direct Blue color
                         lineStyle: { width: 2 }, showSymbol: true, symbol: 'circle', symbolSize: 6
                     }
                 ]
             };
            lineChartInstance.setOption(option);
            console.log("--- Line chart initialized successfully.");
        } catch (error) {
            console.error("--- !!! Error initializing line chart:", error, error.stack);
        }
         console.log("-- Finished attempting to initialize Line Chart --");
    }


    // --- Radar Chart (Using Direct Colors) ---
    function initRadarChart() {
         console.log("-- Attempting to initialize Radar Chart (Full Styling) --");
        const chartDom = document.getElementById('radarChart');
         console.log("--- Radar chart DOM element found:", chartDom);
         if (!chartDom) {
             console.error("--- ERROR: Radar chart DOM element with ID 'radarChart' NOT found! Cannot initialize.");
              const container = document.querySelector('.chart-container.small-chart:nth-of-type(1)');
              if(container) container.innerHTML = "<p style='text-align:center; color:red; padding-top: 60px;'>Error: Chart element not found.</p>";
             return;
        }
         const existingInstance = echarts.getInstanceByDom(chartDom);
        if (existingInstance) {
             console.log("--- Radar chart already initialized. Resizing.");
             radarChartInstance = existingInstance;
             radarChartInstance.resize();
             return;
        }
        try {
             console.log("--- Initializing new Radar Chart instance (Full Styling)...");
             radarChartInstance = echarts.init(chartDom);
             console.log("--- Radar chart instance created.");
             const option = {
                 tooltip: { trigger: 'item' },
                 legend: {
                     data: ['Allocated Budget', 'Expected Spending', 'Actual Spending'],
                     bottom: 5, itemGap: 10, textStyle: { fontSize: 11 }
                 },
                 radar: {
                     indicator: [
                        { name: 'Sales', max: 100 }, { name: 'Marketing', max: 100 }, { name: 'Development', max: 100 },
                        { name: 'Technology', max: 100 }, { name: 'Administration', max: 100 }, { name: 'Customer Support', max: 100 }
                     ],
                     shape: 'polygon', center: ['50%', '50%'], radius: '60%',
                     axisName: { color: '#777', fontSize: 11, padding: [3, 5] },
                     splitArea: { areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(235,235,235,0.3)'], shadowColor: 'rgba(0, 0, 0, 0.2)', shadowBlur: 5 } },
                     splitLine: { lineStyle: { color: '#ddd', width: 1 } }, axisLine: { lineStyle: { color: '#ccc', width: 1 } }
                 },
                 series: [{
                     name: 'Budget Comparison',
                     type: 'radar',
                     data: [
                         {
                             value: [90, 70, 85, 80, 75, 85], name: 'Allocated Budget', symbol: 'none',
                             lineStyle: { color: '#1abc9c' }, // Direct Teal
                             itemStyle: { color: '#1abc9c' }, // Direct Teal
                             areaStyle: { color: 'rgba(26, 188, 156, 0.3)', opacity: 0.6 } // Teal Area
                         },
                         {
                             value: [70, 75, 60, 65, 60, 70], name: 'Expected Spending', symbol: 'none',
                             lineStyle: { color: '#9b59b6' }, // Direct Purple
                             itemStyle: { color: '#9b59b6' }, // Direct Purple
                             areaStyle: { color: 'rgba(155, 89, 182, 0.2)', opacity: 0.6 } // Purple Area
                         },
                         {
                             value: [85, 90, 70, 75, 50, 65], name: 'Actual Spending', symbol: 'none',
                             lineStyle: { color: '#4a90e2' }, // Direct Blue
                             itemStyle: { color: '#4a90e2' }, // Direct Blue
                             areaStyle: { color: 'rgba(74, 144, 226, 0.5)', opacity: 0.8 } // Blue Area
                         }
                     ]
                 }]
             };
             radarChartInstance.setOption(option);
             console.log("--- Radar chart initialized successfully (Full Styling).");
        } catch (error) {
             console.error("--- !!! Error initializing radar chart:", error, error.stack);
        }
         console.log("-- Finished attempting to initialize Radar Chart --");
    }

    // --- Pie Chart (Using Direct Colors & Fine-tuned Labels) ---
    function initPieChart() {
         console.log("-- Attempting to initialize Pie Chart --");
        const chartDom = document.getElementById('pieChart');
         console.log("--- Pie chart DOM element found:", chartDom);
         if (!chartDom) {
             console.error("--- ERROR: Pie chart DOM element with ID 'pieChart' NOT found! Cannot initialize.");
             const container = document.querySelector('.chart-container.small-chart:nth-of-type(2)');
             if(container) container.innerHTML = "<p style='text-align:center; color:red; padding-top: 60px;'>Error: Chart element not found.</p>";
             return;
        }
         const existingInstance = echarts.getInstanceByDom(chartDom);
        if (existingInstance) {
             console.log("--- Pie chart already initialized. Resizing.");
             pieChartInstance = existingInstance;
             pieChartInstance.resize();
             return;
        }
        try {
             console.log("--- Initializing new Pie Chart instance...");
             pieChartInstance = echarts.init(chartDom);
             console.log("--- Pie chart instance created.");
             const option = {
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: {
                    orient: 'vertical', left: 10, top: 'middle', itemGap: 8,
                    // Ensure legend data matches series data order
                    data: ['Industrie', 'Technology', 'Forex', 'Gold', 'Forecasts']
                },
                series: [
                    {
                        name: 'Category', type: 'pie', radius: ['45%', '70%'], center: ['65%', '50%'], avoidLabelOverlap: false, // Allow potential overlap for closer look
                        label: {
                            show: true,
                            position: 'outside', // Position labels outside
                            formatter: '{b}', // Show name only on label
                            color: '#555', // Label text color
                            fontSize: 11 // Label font size
                        },
                        labelLine: {
                            show: true, // Show label lines
                            length: 10, // Adjust line length
                            length2: 15, // Adjust second segment length
                            smooth: false, // Use straight lines
                            lineStyle: { color: '#bbb' } // Line color
                        },
                        emphasis: {
                            label: { show: true, fontSize: 12, fontWeight: 'bold' }
                        },
                        data: [
                            // Use direct colors
                            { value: 550, name: 'Industrie', itemStyle: { color: '#1abc9c'} }, // Teal
                            { value: 280, name: 'Technology', itemStyle: { color: '#9b59b6'} }, // Purple
                            { value: 150, name: 'Forex', itemStyle: { color: '#5dade2'} }, // Blue
                            { value: 50, name: 'Gold', itemStyle: { color: '#f39c12'} }, // Orange
                            { value: 120, name: 'Forecasts', itemStyle: { color: '#e74c3c'} } // Red
                        ]
                    }
                ]
            };
             pieChartInstance.setOption(option);
             console.log("--- Pie chart initialized successfully.");
        } catch (error) {
             console.error("--- !!! Error initializing pie chart:", error, error.stack);
        }
         console.log("-- Finished attempting to initialize Pie Chart --");
    }

    // --- Bar Chart (Already using Direct Colors) ---
     function initBarChart() {
         console.log("-- Attempting to initialize Bar Chart --");
        const chartDom = document.getElementById('barChart');
         console.log("--- Bar chart DOM element found:", chartDom);
         if (!chartDom) {
             console.error("--- ERROR: Bar chart DOM element with ID 'barChart' NOT found! Cannot initialize.");
              const container = document.querySelector('.chart-container.small-chart:nth-of-type(3)');
              if(container) container.innerHTML = "<p style='text-align:center; color:red; padding-top: 60px;'>Error: Chart element not found.</p>";
             return;
        }
         const existingInstance = echarts.getInstanceByDom(chartDom);
        if (existingInstance) {
             console.log("--- Bar chart already initialized. Resizing.");
             barChartInstance = existingInstance;
             barChartInstance.resize();
             return;
        }
        try {
             console.log("--- Initializing new Bar Chart instance...");
             barChartInstance = echarts.init(chartDom);
             console.log("--- Bar chart instance created.");
             const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisTick: { show: false }, axisLine: { lineStyle: { color: '#ddd' } }, axisLabel: { color: '#666' } },
                yAxis: { type: 'value', max: 1200, axisLine: { show: true, lineStyle: { color: '#ddd' } }, axisLabel: { color: '#666' }, splitLine: { lineStyle: { color: '#eee', type: 'dashed' } } },
                series: [
                    { name: 'Series A', type: 'bar', stack: 'total', barWidth: '50%', itemStyle: { color: '#b3a3d3' }, data: [300, 100, 200, 320, 380, 320, 220] }, // Direct Color
                     { name: 'Series B', type: 'bar', stack: 'total', itemStyle: { color: '#8ec6ef' }, data: [280, 50, 400, 680, 800, 650, 430] } // Direct Color
                ]
            };
             barChartInstance.setOption(option);
             console.log("--- Bar chart initialized successfully.");
        } catch (error) {
             console.error("--- !!! Error initializing bar chart:", error, error.stack);
        }
         console.log("-- Finished attempting to initialize Bar Chart --");
    }


    // Optional: Add resize listener - added within initializeCharts
    // window.addEventListener('resize', resizeCharts);


}); // End DOMContentLoaded