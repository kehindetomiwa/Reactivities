using System.Diagnostics;

namespace API.Middleware;

/// <summary>
/// Records how long each request spends in the pipeline. Emits a log line per
/// request and a standard <c>Server-Timing</c> header that browser devtools
/// render natively in the Network panel's Timing tab.
/// </summary>
public class RequestTimingMiddleware(ILogger<RequestTimingMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var stopwatch = Stopwatch.StartNew();

        // Headers are immutable once the response has begun, so the header value
        // has to be written from OnStarting. It therefore measures time-to-first-
        // byte, not the full request - the log line below is the fuller number.
        context.Response.OnStarting(() =>
        {
            context.Response.Headers["Server-Timing"] =
                $"app;dur={stopwatch.Elapsed.TotalMilliseconds:F1}";
            return Task.CompletedTask;
        });

        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();
            logger.LogInformation(
                "{Method} {Path} responded {StatusCode} in {ElapsedMilliseconds:F1}ms",
                context.Request.Method,
                context.Request.Path.Value,
                context.Response.StatusCode,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
