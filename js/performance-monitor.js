/**
 * Evolve Acoustics Performance Monitor
 *
 * This script monitors performance metrics related to scroll and touch events
 * to measure the effectiveness of passive event listeners.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Performance data storage
    const perfData = {
        touchEvents: [],
        scrollEvents: [],
        wheelEvents: []
    };

    // Maximum number of samples to collect per event type
    const MAX_SAMPLES = 100;

    // Reference to our final output div
    let perfReportDiv = null;

    // Create performance monitor UI
    function createPerfMonitor() {
        // Create container for performance data
        const monitorDiv = document.createElement('div');
        monitorDiv.style.position = 'fixed';
        monitorDiv.style.bottom = '10px';
        monitorDiv.style.right = '10px';
        monitorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        monitorDiv.style.color = '#fff';
        monitorDiv.style.padding = '10px';
        monitorDiv.style.borderRadius = '5px';
        monitorDiv.style.fontSize = '12px';
        monitorDiv.style.zIndex = '9999';
        monitorDiv.style.maxWidth = '300px';
        monitorDiv.style.maxHeight = '200px';
        monitorDiv.style.overflowY = 'auto';
        monitorDiv.style.display = 'none'; // Hidden by default

        // Add header
        const header = document.createElement('h3');
        header.textContent = 'Performance Monitor';
        header.style.margin = '0 0 10px 0';
        header.style.fontSize = '14px';
        monitorDiv.appendChild(header);

        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Toggle Monitor';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '10px';
        toggleButton.style.right = '10px';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.backgroundColor = '#2a9d8f';
        toggleButton.style.color = '#fff';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '10000';

        // Performance report content
        const reportDiv = document.createElement('div');
        reportDiv.id = 'perf-report';
        reportDiv.innerHTML = '<p>Collecting performance data...</p>';
        monitorDiv.appendChild(reportDiv);
        perfReportDiv = reportDiv;

        // Add to DOM
        document.body.appendChild(monitorDiv);
        document.body.appendChild(toggleButton);

        // Toggle visibility
        toggleButton.addEventListener('click', function() {
            if (monitorDiv.style.display === 'none') {
                monitorDiv.style.display = 'block';
                updatePerfReport();
            } else {
                monitorDiv.style.display = 'none';
            }
        });

        return monitorDiv;
    }

    // Update the performance report with latest metrics
    function updatePerfReport() {
        if (!perfReportDiv) return;

        // Calculate average durations
        const touchAvg = calculateAverage(perfData.touchEvents);
        const scrollAvg = calculateAverage(perfData.scrollEvents);
        const wheelAvg = calculateAverage(perfData.wheelEvents);

        // Update UI
        perfReportDiv.innerHTML = `
            <p><strong>Touch Events:</strong> ${touchAvg.toFixed(2)}ms avg (${perfData.touchEvents.length} samples)</p>
            <p><strong>Scroll Events:</strong> ${scrollAvg.toFixed(2)}ms avg (${perfData.scrollEvents.length} samples)</p>
            <p><strong>Wheel Events:</strong> ${wheelAvg.toFixed(2)}ms avg (${perfData.wheelEvents.length} samples)</p>
            <p><small>Passive event listeners are ${window.passiveSupported ? 'supported' : 'not supported'} by this browser</small></p>
        `;
    }

    // Calculate average from an array of numbers
    function calculateAverage(arr) {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((a, b) => a + b, 0);
        return sum / arr.length;
    }

    // Setup event performance monitoring
    function setupPerfMonitoring() {
        // Monitor touch events
        const origTouch = Element.prototype.addEventListener;
        Element.prototype.addEventListener = function(type, listener, options) {
            if (type.startsWith('touch')) {
                const wrappedListener = function(e) {
                    const start = performance.now();
                    const result = listener.apply(this, arguments);
                    const duration = performance.now() - start;

                    if (perfData.touchEvents.length < MAX_SAMPLES) {
                        perfData.touchEvents.push(duration);
                        updatePerfReport();
                    }

                    return result;
                };
                return origTouch.call(this, type, wrappedListener, options);
            }
            return origTouch.call(this, type, listener, options);
        };

        // Monitor scroll events
        window.addEventListener('scroll', function() {
            const duration = performance.now() - window.lastScrollTime;
            if (perfData.scrollEvents.length < MAX_SAMPLES && duration < 100) { // Filter out outliers
                perfData.scrollEvents.push(duration);
                updatePerfReport();
            }
            window.lastScrollTime = performance.now();
        }, { passive: true });

        // Monitor wheel events
        window.addEventListener('wheel', function() {
            const duration = performance.now() - window.lastWheelTime;
            if (perfData.wheelEvents.length < MAX_SAMPLES && duration < 100) { // Filter out outliers
                perfData.wheelEvents.push(duration);
                updatePerfReport();
            }
            window.lastWheelTime = performance.now();
        }, { passive: true });

        // Initialize timestamps
        window.lastScrollTime = performance.now();
        window.lastWheelTime = performance.now();
    }

    // Initialize
    createPerfMonitor();
    setupPerfMonitoring();

    console.log('Performance monitoring initialized');
});
