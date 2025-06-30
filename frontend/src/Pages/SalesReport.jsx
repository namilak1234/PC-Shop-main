import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { FaSpinner, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import Notification from '../Components/Notification';

const SalesReport = () => {
  // State variables to manage the component's data and UI state
  const [salesReport, setSalesReport] = useState([]); // Stores the sales report data fetched from the server
  const [selectedMonth, setSelectedMonth] = useState(''); // Stores the month selected by the user
  const [selectedYear, setSelectedYear] = useState(''); // Stores the year selected by the user
  const [loading, setLoading] = useState(false); // Indicates whether data is currently being loaded
  const [error, setError] = useState(''); // Stores any error messages that occur during data fetching
  const [notification, setNotification] = useState({ message: '', type: '' }); // Stores notification messages to display to the user

  // Function to calculate the total sum of the 'total' field in the sales report
  const calculateTotalSum = () => {
    return salesReport.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  };

  // Function to fetch the sales report data from the server based on the selected month and year
  const fetchSalesReport = async () => {
    // Validate that both month and year are selected
    if (!selectedMonth || !selectedYear) {
      setError('Please select both month and year.');
      return;
    }

    // Clear any previous errors and set loading state to true
    setError('');
    setLoading(true);
    setSalesReport([]); // Clear previous sales report data

    try {
      // Make a GET request to the server to fetch the sales report data
      const response = await axios.get('http://localhost:3000/api/orders/sales-report', {
        params: { month: selectedMonth, year: selectedYear },
      });

      // Process the response data
      if (response.data && response.data.length > 0) {
        const processedData = response.data.map(item => ({
          ...item,
          quantity: parseInt(item.quantity, 10), // Convert quantity to an integer
          price: parseFloat(item.price), // Convert price to a float
          total: parseFloat(item.total) // Convert total to a float
        }));

        setSalesReport(processedData); // Update the state with the processed data

        // Show a success notification
        setNotification({
          message: 'Sales report generated successfully!',
          type: 'success'
        });
      } else {
        // Show an error if no data is found for the selected month and year
        setError('No sales data found for the selected month and year.');
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
      // Handle different types of errors
      if (err.response && err.response.status === 404) {
        setError('No sales data found for the selected month and year.');
      } else {
        setError('Failed to fetch sales report. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading state to false after data fetching is complete
    }
  };

  // Function to download the sales report as a PDF
  const downloadPDF = () => {
    const doc = new jsPDF(); // Create a new PDF document
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20; // Starting y position for the PDF content

    // Set the title of the PDF
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Sales Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Set the subtitle of the PDF with the selected month and year
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text(
      `${getMonthName(selectedMonth)} ${selectedYear}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 10;

    // Draw a line under the subtitle
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;

    // Check if there is no sales data to display
    if (salesReport.length === 0) {
      // Display an error message in the PDF
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text(
        'No sales data found for the selected month and year.',
        pageWidth / 2,
        yPosition + 10,
        { align: 'center' }
      );

      // Draw a red box around the error message
      doc.setDrawColor(231, 76, 60);
      doc.setLineWidth(0.5);
      const textWidth = doc.getTextWidth('No sales data found for the selected month and year.');
      const boxX = (pageWidth - textWidth) / 2 - 10;
      doc.rect(boxX, yPosition + 3, textWidth + 20, 15);

    } else {
      // Define the margin and column widths for the table
      const margin = 10;
      const colWidths = [pageWidth * 0.3, pageWidth * 0.15, pageWidth * 0.25, pageWidth * 0.25];
      const lineHeight = 10; // Height of each table row

      // Draw the table header with column titles
      doc.setFillColor(52, 152, 219);
      doc.rect(margin, yPosition, pageWidth - (2 * margin), lineHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      let xPos = margin + 5;
      doc.text('Product', xPos, yPosition + 7);
      xPos += colWidths[0];
      doc.text('Quantity', xPos, yPosition + 7);
      xPos += colWidths[1];
      doc.text('Unit Price (Rs.)', xPos, yPosition + 7);
      xPos += colWidths[2];
      doc.text('Total (Rs.)', xPos, yPosition + 7);

      yPosition += lineHeight;

      // Draw the table rows with sales data
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      let isAlternateRow = false; // Flag to alternate row colors
      salesReport.forEach((item, index) => {
        if (isAlternateRow) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPosition, pageWidth - (2 * margin), lineHeight, 'F');
        }
        isAlternateRow = !isAlternateRow;

        const totalValue = parseFloat(item.total) || 0;
        const priceValue = parseFloat(item.price) || 0;

        xPos = margin + 5;
        doc.text(item.productTitle.substring(0, 30), xPos, yPosition + 7); // Truncate product title if too long

        xPos = margin + colWidths[0] + 5;
        doc.text(item.quantity.toString(), xPos, yPosition + 7);

        xPos = margin + colWidths[0] + colWidths[1] + 5;
        doc.text(
          priceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          xPos,
          yPosition + 7
        );

        xPos = margin + colWidths[0] + colWidths[1] + colWidths[2] + 5;
        doc.text(
          totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          xPos,
          yPosition + 7
        );

        yPosition += lineHeight;

        // Check if the content exceeds the page height and add a new page if necessary
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Draw the table footer with the total sum
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(margin, yPosition - (salesReport.length * lineHeight), pageWidth - (2 * margin), salesReport.length * lineHeight);

      let vertLineX = margin;
      for (let i = 0; i < colWidths.length; i++) {
        vertLineX += colWidths[i];
        doc.line(
          vertLineX,
          yPosition - (salesReport.length * lineHeight),
          vertLineX,
          yPosition
        );
      }

      let horizontalLineY = yPosition - (salesReport.length * lineHeight) + lineHeight;
      for (let i = 0; i < salesReport.length - 1; i++) {
        doc.line(
          margin,
          horizontalLineY,
          pageWidth - margin,
          horizontalLineY
        );
        horizontalLineY += lineHeight;
      }

      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, yPosition, pageWidth - (2 * margin), lineHeight, 'F');

      doc.text('Total:', margin + 5, yPosition + 7);
      doc.text(
        `Rs. ${calculateTotalSum().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - margin - 5,
        yPosition + 7,
        { align: 'right' }
      );

      // Add the generation date and time at the bottom of the PDF
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF with a filename that includes the month and year
    doc.save(`Sales_Report_${getMonthName(selectedMonth)}_${selectedYear}.pdf`);

    // Show a success notification
    setNotification({
      message: 'PDF downloaded successfully!',
      type: 'success'
    });
  };

  // Function to get the month name from the month number
  const getMonthName = (monthNumber) => {
    return new Date(0, monthNumber - 1).toLocaleString('default', { month: 'long' });
  };

  // Effect to clear the notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);

      // Clear the timeout if the component unmounts or if the notification changes
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="container mx-auto p-6">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 ">Sales Report</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {[...Array(5)].map((_, i) => (
              <option key={i} value={2025 - i}>
                {2025 - i}
              </option>
            ))}
          </select>

          <button
            onClick={fetchSalesReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200 ease-in-out flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Loading...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
            {error.includes('No sales data found') && selectedMonth && selectedYear && (
              <button
                onClick={downloadPDF}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition duration-200 ease-in-out"
              >
                Download Empty Report
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        )}

        {salesReport.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {getMonthName(selectedMonth)} {selectedYear} Sales Report
              </h2>
              <button
                onClick={downloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out flex items-center"
              >
                <FaDownload className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Product Title
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesReport.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.productTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        Rs. {parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        Rs. {parseFloat(item.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-700">
                      Rs. {calculateTotalSum().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
