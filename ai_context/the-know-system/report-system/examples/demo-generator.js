#!/usr/bin/env node

/**
 * Report System Demo Generator
 * Demonstrates the capabilities of the Report System
 */

const ReportGenerator = require('../core/report-generator');
const path = require('path');

class ReportSystemDemo {
  constructor() {
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Run the complete demo
   */
  async runDemo() {
    console.log('🚀 Starting Report System Demo\n');
    
    try {
      // Initialize the report generator
      await this.reportGenerator.initialize();
      
      // Generate different types of reports
      await this.generateSystemHealthReport();
      await this.generateUsageAnalyticsReport();
      await this.generateCustomReport();
      
      console.log('\n✅ Report System Demo completed successfully!');
      console.log('📁 Check the ./reports directory for generated reports');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    } finally {
      await this.reportGenerator.close();
    }
  }

  /**
   * Generate system health report
   */
  async generateSystemHealthReport() {
    console.log('📊 Generating System Health Report...');
    
    const options = {
      format: 'markdown',
      save: true,
      timeframe: 'last-7-days'
    };
    
    try {
      const report = await this.reportGenerator.generateReport('system-health', options);
      console.log('✅ System Health Report generated');
      console.log('📄 Preview:');
      console.log(report.substring(0, 500) + '...\n');
    } catch (error) {
      console.log(`❌ Failed to generate System Health Report: ${error.message}\n`);
    }
  }

  /**
   * Generate usage analytics report
   */
  async generateUsageAnalyticsReport() {
    console.log('📈 Generating Usage Analytics Report...');
    
    const options = {
      format: 'html',
      save: true,
      timeframe: 'last-30-days'
    };
    
    try {
      const report = await this.reportGenerator.generateReport('usage-analytics', options);
      console.log('✅ Usage Analytics Report generated');
      console.log('📄 HTML report created with interactive elements\n');
    } catch (error) {
      console.log(`❌ Failed to generate Usage Analytics Report: ${error.message}\n`);
    }
  }

  /**
   * Generate custom report with specific options
   */
  async generateCustomReport() {
    console.log('🔧 Generating Custom Report...');
    
    // Create a custom report configuration
    const customTemplate = {
      report_metadata: {
        name: 'The Know Ecosystem Overview',
        description: 'Complete overview of The Know project ecosystem'
      },
      data_sources: ['the-know-intelligence', 'template-system', 'peanut-butter-user']
    };
    
    // Temporarily add custom template
    this.reportGenerator.templates.set('ecosystem-overview', customTemplate);
    
    const options = {
      format: 'json',
      save: true,
      timeframe: 'all-time'
    };
    
    try {
      const report = await this.reportGenerator.generateReport('ecosystem-overview', options);
      console.log('✅ Custom Ecosystem Overview Report generated');
      console.log('📄 JSON format with complete data structure\n');
    } catch (error) {
      console.log(`❌ Failed to generate Custom Report: ${error.message}\n`);
    }
  }

  /**
   * Demonstrate different output formats
   */
  async demonstrateFormats() {
    console.log('🎨 Demonstrating different output formats...');
    
    const formats = ['markdown', 'html', 'json', 'csv'];
    
    for (const format of formats) {
      try {
        console.log(`   Generating ${format.toUpperCase()} format...`);
        
        const report = await this.reportGenerator.generateReport('system-health', {
          format: format,
          save: false
        });
        
        console.log(`   ✅ ${format.toUpperCase()} format generated successfully`);
        
      } catch (error) {
        console.log(`   ❌ Failed to generate ${format.toUpperCase()}: ${error.message}`);
      }
    }
    
    console.log('');
  }

  /**
   * Show available templates
   */
  async showAvailableTemplates() {
    console.log('📋 Available Report Templates:');
    
    for (const [templateName, template] of this.reportGenerator.templates) {
      console.log(`   • ${templateName}`);
      if (template.report_metadata) {
        console.log(`     Description: ${template.report_metadata.description || 'No description'}`);
        console.log(`     Category: ${template.report_metadata.category || 'Uncategorized'}`);
      }
    }
    
    console.log('');
  }

  /**
   * Static runner
   */
  static async run() {
    const demo = new ReportSystemDemo();
    await demo.runDemo();
  }
}

// Run if called directly
if (require.main === module) {
  ReportSystemDemo.run().catch(console.error);
}

module.exports = ReportSystemDemo;
