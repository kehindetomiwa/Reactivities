using System.Diagnostics;

namespace API.Middleware;

/// <summary>
/// Records how long each request spends in the pipeline. Emits a log line per
/// request and a standard <c>Server-Timing</c> header that browser devtools
/// render natively in the Network panel's Timing tab.
/// </summary>
public class RequestTimingMiddleware(
    ILogger<RequestTimingMiddleware> logger,
    IHostEnvironment env) : IMiddleware
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

            // The client runs on :3000 and the API on :5001, so every response is
            // cross-origin. Browsers withhold Server-Timing from cross-origin
            // resources unless Timing-Allow-Origin opts in - without this the
            // header above reaches the browser but devtools and the Resource
            // Timing API both refuse to surface it. Development only: it exposes
            // timing data to whichever origin asked.
            var origin = context.Request.Headers.Origin.ToString();
            if (env.IsDevelopment() && !string.IsNullOrEmpty(origin))
            {
                context.Response.Headers["Timing-Allow-Origin"] = origin;
            }

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
