<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=1">
    <title>Configure WATI</title>

    {{-- Only include React Refresh in development --}}
    @if (app()->environment('local'))
        @viteReactRefresh
    @endif

    {{-- Load your CSS and JS --}}
    @vite(['resources/js/app.jsx'])

</head>
<body>
    <div id="wati-config-layout"></div>
</body>
</html>
