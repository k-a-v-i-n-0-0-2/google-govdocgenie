"""
GovDoc Genie - Datadog Observability Client
============================================
Production-grade Datadog metrics for hackathon observability challenge.

Metrics Emitted:
- govdoc.app.startup: Application initialization
- govdoc.ocr.confidence: OCR quality per page
- govdoc.ocr.document_confidence: Document-level OCR quality
- govdoc.evidence.generated: Compliance evidence tracking
- govdoc.compliance.mismatch: Validation mismatch tracking
- govdoc.compliance.score: Final compliance score

Usage:
    from modules.datadog_client import init_datadog, gauge, increment
    
    # At app startup
    init_datadog()
    gauge("govdoc.app.startup", 1)
    
    # In OCR processing
    gauge("govdoc.ocr.confidence", 0.95)
    
    # In evidence tracking
    increment("govdoc.evidence.generated")
"""

import os
from datadog import initialize, statsd

# Global flag to prevent re-initialization
_datadog_initialized = False


def init_datadog():
    """
    Initialize Datadog with environment variables.
    Must be called exactly once at application startup.
    
    Environment Variables Required:
    - DATADOG_API_KEY: Your Datadog API key
    - DATADOG_APP_KEY: Your Datadog application key
    
    Optional:
    - DATADOG_HOST: StatsD host (default: 127.0.0.1)
    - DATADOG_PORT: StatsD port (default: 8125)
    """
    global _datadog_initialized
    
    if _datadog_initialized:
        print("⚠️  Datadog already initialized, skipping...")
        return
    
    api_key = os.getenv("DATADOG_API_KEY")
    app_key = os.getenv("DATADOG_APP_KEY")
    
    if not api_key or not app_key:
        print("⚠️  WARNING: Datadog credentials not found in environment")
        print("   Set DATADOG_API_KEY and DATADOG_APP_KEY to enable metrics")
        print("   Application will continue without observability")
        return
    
    try:
        statsd_host = os.getenv("DATADOG_HOST", "127.0.0.1")
        statsd_port = int(os.getenv("DATADOG_PORT", "8125"))
        
        initialize(
            api_key=api_key,
            app_key=app_key,
            statsd_host=statsd_host,
            statsd_port=statsd_port
        )
        _datadog_initialized = True
        print("✅ Datadog initialized successfully")
        print(f"   Metrics endpoint: statsd://{statsd_host}:{statsd_port}")
        print(f"   Namespace: govdoc.*")
    except Exception as e:
        print(f"❌ Datadog initialization failed: {e}")
        print("   Application will continue without observability")


def gauge(metric_name, value, tags=None):
    """
    Send a gauge metric to Datadog.
    Gauges represent point-in-time values (e.g., confidence scores).
    
    Args:
        metric_name: Metric name (e.g., 'govdoc.ocr.confidence')
        value: Numeric value to report (float or int)
        tags: Optional list of tags ['env:prod', 'version:1.0']
    
    Example:
        gauge('govdoc.ocr.confidence', 0.95, tags=['page:1'])
    """
    if not _datadog_initialized:
        return
    
    try:
        statsd.gauge(metric_name, value, tags=tags or [])
        print(f"📊 [Datadog] Gauge: {metric_name} = {value} {tags or []}")
    except Exception as e:
        print(f"⚠️  Failed to send gauge {metric_name}: {e}")


def increment(metric_name, value=1, tags=None):
    """
    Increment a counter metric in Datadog.
    Counters track the number of events (e.g., evidence generated).
    
    Args:
        metric_name: Metric name (e.g., 'govdoc.evidence.generated')
        value: Amount to increment (default: 1)
        tags: Optional list of tags
    
    Example:
        increment('govdoc.evidence.generated', tags=['field:gst_number'])
    """
    if not _datadog_initialized:
        return
    
    try:
        statsd.increment(metric_name, value=value, tags=tags or [])
        print(f"📈 [Datadog] Counter: {metric_name} +{value} {tags or []}")
    except Exception as e:
        print(f"⚠️  Failed to increment {metric_name}: {e}")


def histogram(metric_name, value, tags=None):
    """
    Send a histogram metric to Datadog.
    Histograms track distributions (e.g., processing time).
    
    Args:
        metric_name: Metric name
        value: Numeric value
        tags: Optional list of tags
    
    Example:
        histogram('govdoc.processing.time', 2.5, tags=['doc_type:gst'])
    """
    if not _datadog_initialized:
        return
    
    try:
        statsd.histogram(metric_name, value, tags=tags or [])
        print(f"📊 [Datadog] Histogram: {metric_name} = {value} {tags or []}")
    except Exception as e:
        print(f"⚠️  Failed to send histogram {metric_name}: {e}")


def timing(metric_name, value, tags=None):
    """
    Send a timing metric to Datadog.
    Timings are for measuring durations in milliseconds.
    
    Args:
        metric_name: Metric name
        value: Duration in milliseconds
        tags: Optional list of tags
    
    Example:
        timing('govdoc.ocr.duration', 1500, tags=['page:1'])
    """
    if not _datadog_initialized:
        return
    
    try:
        statsd.timing(metric_name, value, tags=tags or [])
        print(f"⏱️  [Datadog] Timing: {metric_name} = {value}ms {tags or []}")
    except Exception as e:
        print(f"⚠️  Failed to send timing {metric_name}: {e}")


def is_initialized():
    """
    Check if Datadog has been initialized.
    
    Returns:
        bool: True if initialized, False otherwise
    """
    return _datadog_initialized


def safe_metric(func):
    """
    Decorator to safely emit metrics without crashing on errors.
    
    Usage:
        @safe_metric
        def my_function():
            gauge("my.metric", 1)
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"⚠️  Metric error in {func.__name__}: {e}")
            return None
    return wrapper